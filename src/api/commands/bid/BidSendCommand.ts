import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidMessage } from '../../messages/BidMessage';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BidFactory } from '../../factories/BidFactory';
import { Bid } from '../../models/Bid';
import { SmsgService } from '../../services/SmsgService';
import { BidMessageType } from '../../enums/BidMessageType';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MarketplaceMessageInterface } from '../../messages/MarketplaceMessageInterface';

// Ryno changes
import { CoreRpcService } from '../../services/CoreRpcService';
import { Output } from 'resources';

export class BidSendCommand extends BaseCommand implements RpcCommandInterface<Bid> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory
    ) {
        super(Commands.BID_SEND);
        this.log = new Logger(__filename);
    }

    /**
     * TODO: Check works
     *
     * data.params[]:
     * [0]: itemhash, string
     * [1]: addressId (from profile deliveryaddresses)
     * [2]: bidDataId, string
     * [3]: bidDataValue, string
     * [4]: bidDataId, string
     * [5]: bidDataValue, string
     * ......
     *
     * @param data
     * @returns {Promise<Bookshelf<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bid> {
        // find listingItem by hash
        const listingItem = await this.listingItemService.findOneByHash(data.params[0]);

        // if listingItem not found
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${data.params[0]} was not found!`);
            throw new NotFoundException(data.params[0]);
        } else {
            // get listing item hash it is in first argument in the data.params
            const listingItemHash = data.params.shift();

            // TODO: Ryno Hacks - Refactor code below...
            // Get unspent
            const unspent = await this.coreRpcService.call('listunspent', [1, 99999999, [], false]);
            const outputs: Output[] = [];
            const listingItemPrice = listingItem.toJSON().PaymentInformation.ItemPrice;
            const basePrice = listingItemPrice.basePrice;
            const shippingPriceMax = Math.max(
                listingItemPrice.ShippingPrice.international,
                listingItemPrice.ShippingPrice.domestic);
            const totalPrice = basePrice + shippingPriceMax;

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
                    if (sum > (totalPrice * 2)) { // TODO: Ratio
                        change = +(sum - (totalPrice * 2) - 0.0002).toFixed(8); // TODO: Get actual fee...
                        return true;
                    }
                    return false;
                });

                if (sum < basePrice) {
                    throw new Error('You are too broke...');
                }
            } else {
                throw new Error(`ListingItem with the hash=${listingItemHash} does not have a price!`);
            }

            const addr = await this.coreRpcService.call('getaccountaddress', ['_escrow_pub_' + listingItem.Hash]);
            const changeAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_change']);
            const pubkey = (await this.coreRpcService.call('validateaddress', [addr])).pubkey;

            // convert the bid data params as bid data key value pair
            const bidData = this.setBidData(data.params.concat([
                'outputs', outputs, 'pubkeys', [pubkey], 'changeAddr', changeAddr, 'change', change
            ]));
            // End - Ryno Hacks

            // broadcast the message in to the network
            // TODO: add profile and market addresses
            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: {
                    objects: bidData,
                    listing: listingItemHash,
                    action: BidMessageType.MPA_BID
                }
            } as MarketplaceMessageInterface;

            await this.smsgService.smsgSend('', '', marketPlaceMessage);

            // TODO: We will change the return data once broadcast functionality will be implemented
            // TODO: We might potentially want to save the bid if we ever want to cancel it, but its an outgoing bid.
            return data;
        }
    }

    public usage(): string {
        return this.getName() + ' <itemhash> [(<bidDataId>, <bidDataValue>), ...] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to send bids for. \n'
            + '    <addressId>              - Numeric - The addressId of the related profile we want to use \n' // <--- TODO
            + '    <bidDataId>              - [optional] Numeric - The id of the bid we want to send. \n'
            + '    <bidDataValue>           - [optional] String - The value of the bid we want to send. ';
    }

    public description(): string {
        return 'Send bid.';
    }

    public example(): string {
        return '';
        // return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb 1 [TODO] ';
    }

    /**
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
