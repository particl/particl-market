import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import * as resources from 'resources';
import { MessageException } from '../exceptions/MessageException';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';

import { EventEmitter } from 'events';

import { ActionMessageService } from './ActionMessageService';
import { BidService } from './BidService';
import { ProfileService } from './ProfileService';
import { MarketService } from './MarketService';
import { BidFactory } from '../factories/BidFactory';
import { SmsgService } from './SmsgService';
import { CoreRpcService } from './CoreRpcService';
import { ListingItemService } from './ListingItemService';

import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { Market } from '../models/Market';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { Output } from 'resources';
import { BidMessage } from '../messages/BidMessage';
declare function unescape(s: string): string;

export class BidActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) public actionMessageService: ActionMessageService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * Posts a Bid to the network
     *
     * @param {"resources".ListingItem} listingItem
     * @param {any[]} params
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send( listingItem: resources.ListingItem, params: any[] ): Promise<SmsgSendResponse> {

        // TODO: some of this stuff could propably be moved to the factory
        // Get unspent
        const unspent = await this.coreRpcService.call('listunspent', [1, 99999999, [], false]);
        const outputs: Output[] = [];
        const listingItemPrice = listingItem.PaymentInformation.ItemPrice;
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
                throw new MessageException('You are too broke...');
            }
        } else {
            throw new MessageException(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
        }

        const addr = await this.coreRpcService.call('getaccountaddress', ['_escrow_pub_' + listingItem.hash]);
        const changeAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_change']);
        const pubkey = (await this.coreRpcService.call('validateaddress', [addr])).pubkey;

        // convert the bid data params as bid data key value pair
        const bidData = this.getBidData(params.concat([
            'outputs', outputs, 'pubkeys', [pubkey], 'changeAddr', changeAddr, 'change', change
        ]));

        // fetch the profile
        const profileModel = await this.profileService.getDefault();
        const profile = profileModel.toJSON();

        // fetch the market
        const marketModel: Market = await this.marketService.findOne(listingItem.Market.id);
        const market = marketModel.toJSON();

        const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_BID, listingItem.hash, bidData);

        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: bidMessage
        } as MarketplaceMessage;

        this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

        // broadcast the message in to the network
        return await this.smsgService.smsgSend(profile.address, market.address, marketPlaceMessage);
    }

    /**
     * Accept a Bid
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    public async accept( listingItem: resources.ListingItem, bid: resources.Bid ): Promise<SmsgSendResponse> {

        // last bids action needs to be MPA_BID
        if (bid.action === BidMessageType.MPA_BID) {

            // TODO: Ryno Hacks - Refactor code below...
            // This is a copy and paste - hacks hacks hacks ;(
            // Get unspent
            const unspent = await this.coreRpcService.call('listunspent', [1, 99999999, [], false]);
            const outputs: Output[] = [];
            const listingItemPrice = listingItem.PaymentInformation.ItemPrice;
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
                        change = +(sum - totalPrice - 0.0001).toFixed(8); // TODO: Get actual fee...
                        return true;
                    }
                    return false;
                });

                if (sum < basePrice) {
                    this.log.error('Not enough funds');
                    throw new MessageException('You are too broke...');
                }
            } else {
                this.log.error(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
                throw new MessageException(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
            }

            const addr = await this.coreRpcService.call('getaccountaddress', ['_escrow_pub_' + listingItem.hash]);
            const changeAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_change']); // TODO: Proper change address?!?!
            const pubkey = (await this.coreRpcService.call('validateaddress', [addr])).pubkey;

            let buyerPubkey = this.getValueFromBidDatas('pubkeys', bid.BidDatas);
            buyerPubkey = buyerPubkey[0] === '[' ? JSON.parse(buyerPubkey)[0] : buyerPubkey;

            this.log.debug('buyerPubkey', buyerPubkey);

            // Create Escrow address
            const escrow = (await this.coreRpcService.call('addmultisigaddress', [
                2,
                [pubkey, buyerPubkey].sort(),
                '_escrow_' + listingItem.hash  // TODO: Something unique??
            ]));

            const txout = {};

            txout[escrow] = +(totalPrice * 3).toFixed(8); // TODO: Shipping... ;(
            txout[changeAddr] = change;

            const buyerChangeAddr = this.getValueFromBidDatas('changeAddr', bid.BidDatas); // TODO: Error handling - nice messagee..
            let buyerOutputs = this.getValueFromBidDatas('outputs', bid.BidDatas);

            // TODO: Verify that buyers outputs are unspent?? :/
            if (buyerOutputs) {
                sum = 0;
                change = 0;
                buyerOutputs = JSON.parse(buyerOutputs.dataValue);
                buyerOutputs.forEach(output => {
                    sum += output.amount;
                    // TODO: Refactor reusable logic. and verify / validate buyer change.
                    if (sum > totalPrice * 2) { // TODO: Ratio
                        change = +(sum - (totalPrice * 2) - 0.0001).toFixed(8); // TODO: Get actual fee...
                        return;
                    }
                });
                txout[buyerChangeAddr] = change;
            } else {
                this.log.error('Buyer didn\'t supply outputs!');
                throw new MessageException('Buyer didn\'t supply outputs!'); // TODO: proper message for no outputs :P
            }

            // TODO: Decide if we want this on the blockchain or not...
            // TODO: Think about how to recover escrow information to finalize transactions should
            // client pc / database crash..

            //
            // txout['data'] = unescape(encodeURIComponent(data.params[0]))
            //    .split('').map(v => v.charCodeAt(0).toString(16)).join('').substr(0, 80);
            //

            const rawtx = await this.coreRpcService.call('createrawtransaction', [
                outputs.concat(buyerOutputs),
                txout
            ]);

            // TODO: At this stage we need to store the unsigned transaction, as we will need user interaction to sign
            // the transaction
            const signed = await this.coreRpcService.call('signrawtransaction', [rawtx]);

            if (!signed || (signed.errors && signed.errors[0].error !== 'Operation not valid with the current stack size')) {
                this.log.error('Error signing transaction' + signed ? ': ' + signed.errors[0].error : '');
                throw new MessageException('Error signing transaction' + signed ? ': ' + signed.error : '');
            }

            if (signed.complete) {
                this.log.error('Transaction should not be complete at this stage, will not send insecure message');
                throw new MessageException('Transaction should not be complete at this stage, will not send insecure message');
            }

            // TODO: We need to send a refund / release address
            const releaseAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_release']);
            const bidData = this.getBidData(['pubkeys', [pubkey, buyerPubkey].sort(), 'rawtx', signed.hex, 'address', releaseAddr]);

            // - Most likely the transaction building and signing will happen in a different command that takes place
            // before this..
            // End - Ryno Hacks


            // fetch the profile
            const profileModel = await this.profileService.getDefault();
            const profile = profileModel.toJSON();

            // fetch the market
            const marketModel: Market = await this.marketService.findOne(listingItem.Market.id);
            const market = marketModel.toJSON();

            // create the bid accept message
            const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_ACCEPT, listingItem.hash, bidData);

            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            } as MarketplaceMessage;

            this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

            // broadcast the accepted bid message
            return await this.smsgService.smsgSend(profile.address, market.address, marketPlaceMessage);
        } else {
            this.log.error(`Bid can not be accepted because it was already been ${bid.action}`);
            throw new MessageException(`Bid can not be accepted because it was already been ${bid.action}`);
        }
    }

    /**
     * Cancel a Bid
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    public async cancel( listingItem: resources.ListingItem, bid: resources.Bid ): Promise<SmsgSendResponse> {

        if (bid.action === BidMessageType.MPA_BID) {
            // fetch the profile
            const profileModel = await this.profileService.getDefault();
            const profile = profileModel.toJSON();

            // fetch the market
            const marketModel: Market = await this.marketService.findOne(listingItem.Market.id);
            const market = marketModel.toJSON();

            // create the bid cancel message
            const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_CANCEL, listingItem.hash);

            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            } as MarketplaceMessage;

            this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

            // broadcast the cancel bid message
            return await this.smsgService.smsgSend(profile.address, market.address, marketPlaceMessage);
        } else {
            this.log.error(`Bid can not be cancelled because it was already been ${bid.action}`);
            throw new MessageException(`Bid can not be cancelled because it was already been ${bid.action}`);
        }
    }

    /**
     * Reject a Bid
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    public async reject( listingItem: resources.ListingItem, bid: resources.Bid ): Promise<SmsgSendResponse> {

        if (bid.action === BidMessageType.MPA_BID) {
            // fetch the profile
            const profileModel = await this.profileService.getDefault();
            const profile = profileModel.toJSON();

            // fetch the market
            const marketModel: Market = await this.marketService.findOne(listingItem.Market.id);
            const market = marketModel.toJSON();

            // create the bid reject message
            const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_REJECT, listingItem.hash);

            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            } as MarketplaceMessage;

            this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

            // broadcast the cancel bid message
            return await this.smsgService.smsgSend(profile.address, market.address, marketPlaceMessage);
        } else {
            this.log.error(`Bid can not be rejected because it was already been ${bid.action}`);
            throw new MessageException(`Bid can not be rejected because it was already been ${bid.action}`);
        }
    }

    /**
     * process received BidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // create a bid
        const bidMessage: BidMessage = event.marketplaceMessage.mpaction as BidMessage;

        if (bidMessage) {
            // find listingItem by hash
            const listingItemModel = await this.listingItemService.findOneByHash(bidMessage.item);
            const listingItem = listingItemModel.toJSON();

            const bidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id);
            // TODO: do whatever else needs to be done

            return actionMessage;
        } else {
            throw new MessageException('Missing BidMessage');
        }
    }

    /**
     * process received AcceptBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processAcceptBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    /**
     * process received CancelBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processCancelBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    /**
     * process received RejectBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processRejectBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.BidReceivedEvent, async (event) => {
            await this.processBidReceivedEvent(event);
        });
        this.eventEmitter.on(Events.AcceptBidReceivedEvent, async (event) => {
            await this.processAcceptBidReceivedEvent(event);
        });
        this.eventEmitter.on(Events.CancelBidReceivedEvent, async (event) => {
            await this.processCancelBidReceivedEvent(event);
        });
        this.eventEmitter.on(Events.RejectBidReceivedEvent, async (event) => {
            await this.processRejectBidReceivedEvent(event);
        });
    }

    /**
     * data[]:
     * [0]: id, string
     * [1]: value, string
     * [2]: id, string
     * [3]: value, string
     * ..........
     */
    private getBidData(data: string[]): string[] {
        const bidData = [] as any;

        // convert the bid data params as bid data key value pair
        for ( let i = 0; i < data.length; i += 2 ) {
            bidData.push({id: data[i], value: data[i + 1]});
        }
        return bidData;
    }

    /**
     *
     * @param {string} key
     * @param {"resources".BidData[]} bidDatas
     * @returns {any}
     */
    private getValueFromBidDatas(key: string, bidDatas: resources.BidData[]): any {
        const value = bidDatas.find(kv => kv.dataId === key);
        if ( value ) {
            return value.dataValue;
        } else {
            this.log.error('Missing BidData value for key: ' + key);
            throw new MessageException('Missing BidData value for key: ' + key);
        }
    }
}
