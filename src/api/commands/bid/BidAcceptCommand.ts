import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidMessage } from '../../messages/BidMessage';
import { BidFactory } from '../../factories/BidFactory';
import { ListingItemService } from '../../services/ListingItemService';
import { SmsgService } from '../../services/SmsgService';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import { BidMessageType } from '../../enums/BidMessageType';
import { Bid } from '../../models/Bid';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MarketplaceMessageInterface } from '../../messages/MarketplaceMessageInterface';

// Ryno changes
import { CoreRpcService } from '../../services/CoreRpcService';
import { Output } from 'resources';

export class BidAcceptCommand extends BaseCommand implements RpcCommandInterface<Bid> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory
    ) {
        super(Commands.BID_ACCEPT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: itemhash, string
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bid> {
        // find listingItem by hash
        const listingItem = await this.listingItemService.findOneByHash(data.params[0]);

        // if listingItem not found
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${data.params[0]} was not found!`);
            throw new NotFoundException(data.params[0]);
        } else {
            // find related bid
            // TODO: LATER WE WILL CHANGE IT FOR THE SINGLE BID
            let bid = listingItem.related('Bids').toJSON()[0];
            bid = (await Bid.fetchById(bid.id)).toJSON() as Bid;

            // if bid not found for the given listing item hash
            if (!bid) {
                this.log.warn(`Bid with the listing Item hash=${data.params[0]} was not found!`);
                throw new MessageException(`Bid not found for the listing item hash ${data.params[0]}`);

            } else if (bid.action === BidMessageType.MPA_BID) {

                // TODO: Ryno Hacks - Refactor code below...
                // This is a copy and paste - hacks hacks hacks ;(
                // Get unspent
                const unspent = await this.coreRpcService.call('listunspent', [1, 99999999, [], false]);
                const outputs: Output[] = [];
                const listingItemPrice = listingItem.toJSON().PaymentInformation.ItemPrice;
                const basePrice = listingItemPrice.basePrice;
                const shippingPriceMax = Math.max(
                    listingItemPrice.ShippingPrice.international,
                    listingItemPrice.ShippingPrice.domestic);
                const totalPrice = basePrice + shippingPriceMax; // TODO: Determine if local or international...
                let sum = 0;
                let change = 0;

                if (basePrice) {
                    unspent.find(output => {
                        if (output.spendable && output.solvable) {
                            sum += output.amount;
                            outputs.push({
                                txid: output.txid,
                                vout: output.vout,
                                amount: output.amount
                            });
                        }
                        if (sum > totalPrice) { // TODO: Ratio
                            change = +(sum - (totalPrice - 0.0001)).toFixed(8); // TODO: Get actual fee...
                            return true;
                        }
                        return false;
                    });

                    if (sum < basePrice) {
                        throw new Error('You are too broke...');
                    }
                } else {
                    throw new Error(`ListingItem with the hash=${listingItem.Hash} does not have a price!`);
                }

                const addr = await this.coreRpcService.call('getnewaddress', ['_escrow']);
                const changeAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_change']); // TODO: Proper change address?!?!
                const pubkey = (await this.coreRpcService.call('validateaddress', [addr])).pubkey;

                // Create Escrow address
                // TODO: create raw transaction, sign transaction, booya
                const escrow = (await this.coreRpcService.call('addmultisigaddress', [
                    2,
                    [pubkey, bid.BidData.find(kv => kv.dataId === 'pubkey').dataValue],
                    '_escrow_' // TODO: Something unique??
                ]));

                const txout = {};

                txout[escrow.address] = +(totalPrice * 3).toFixed(8); // TODO: Shipping... ;(
                txout[changeAddr] = change;

                const buyerChangeAddr = bid.BidData.find(kv => kv.dataId === 'changeAddr').dataValue; // TODO: Error handling - nice messagee..
                let buyerOutputs = bid.BidData.find(kv => kv.dataId === 'outputs');

                // TODO: Verify that buyers outputs are unspent?? :/
                if (buyerOutputs) {
                    sum = 0;
                    change = 0;
                    buyerOutputs = JSON.parse(buyerOutputs.dataValue);
                    buyerOutputs.forEach(output => {
                        sum += output.amount;
                        // TODO: Refactor reusable logic..
                        if (sum > totalPrice * 2) { // TODO: Ratio
                            change = +(sum - (totalPrice * 2 - 0.0001)).toFixed(8); // TODO: Get actual fee...
                            return;
                        }
                    });
                    txout[buyerChangeAddr] = change;
                } else {
                    throw new Error('Buyer didn\'t supply outputs!'); // TODO: proper message for no outputs :P
                }

                console.log([
                    outputs.concat(buyerOutputs),
                    txout
                ]);
                const rawtx = await this.coreRpcService.call('createrawtransaction', [
                    outputs.concat(buyerOutputs),
                    txout
                ]);

                // convert the bid data params as bid data key value pair
                const listingItemHash = data.params.shift();
                const bidData = this.setBidData(['pubkey', pubkey, 'rawtx', rawtx]);

                // TODO: This rawtx needs to be signed before it is broadcast...
                // - when we move this logic into the correct place, we need to keep this in mind.
                // End - Ryno Hacks

                // broadcast the accepted bid message
                // TODO: add profile and market addresses
                const marketPlaceMessage = {
                    version: process.env.MARKETPLACE_VERSION,
                    mpaction: {
                        listing: data.params[0],
                        action: BidMessageType.MPA_ACCEPT
                    }
                } as MarketplaceMessageInterface;

                await this.smsgService.smsgSend('', '', marketPlaceMessage);

                // TODO: We will change the return data once broadcast functionality will be implemented
                return bid;

            } else {
                this.log.warn(`Bid can not be accepted because it was already been ${bid.action}`);
                throw new MessageException(`Bid can not be accepted because it was already been ${bid.action}`);
            }
        }
    }

    public usage(): string {
        return this.getName() + ' <itemhash> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to accept. ';
    }

    public description(): string {
        return 'Accept bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }

    /** More copy and paste hacks ;(
     * data[]:
     * [0]: id, string
     * [1]: value, string
     * [2]: id, string
     * [3]: value, string
     * ..........
     */
    private setBidData(data: string[]): string[] {
        const bidData = [] as any;

        // convert the bid data params as bid data key value pair
        for ( let i = 0; i < data.length; i += 2 ) {
          bidData.push({id: data[i], value: data[i + 1]});
        }
        return bidData;
    }
}
