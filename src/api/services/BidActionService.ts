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
import { BidSearchParams } from '../requests/BidSearchParams';
import { AddressType } from '../enums/AddressType';

declare function escape(s: string): string;
declare function unescape(s: string): string;

export class BidActionService {

    public log: LoggerType;

    constructor(@inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
                @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
                @inject(Types.Service) @named(Targets.Service.ActionMessageService) public actionMessageService: ActionMessageService,
                @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
                @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
                @inject(Types.Service) @named(Targets.Service.BidService) public bidService: BidService,
                @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
                @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory,
                @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
                @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * Posts a Bid to the seller
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Profile} profile
     * @param {"resources".Address} shippingAddress
     * @param {any[]} params
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send(listingItem: resources.ListingItem, profile: resources.Profile,
                      shippingAddress: resources.Address, params: any[]): Promise<SmsgSendResponse> {

        // TODO: some of this stuff could propably be moved to the factory
        // TODO: Create new unspent RPC call for unspent outputs that came out of a RingCT transaction

        // Get unspent
        const unspent = await this.coreRpcService.call('listunspent', [1, 99999999, [], false]);
        if (!unspent || unspent.length === 0) {
            this.log.warn('No unspent outputs');
            throw new MessageException('No unspent outputs');
        }
        const outputs: Output[] = [];
        const listingItemPrice = listingItem.PaymentInformation.ItemPrice;
        const basePrice = listingItemPrice.basePrice;
        const shippingPriceMax = Math.max(listingItemPrice.ShippingPrice.international, listingItemPrice.ShippingPrice.domestic);
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
                this.log.warn('You are too broke...');
                throw new MessageException('You are too broke...');
            }

        } else {
            this.log.warn(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
            throw new MessageException(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
        }

        const addr = await this.coreRpcService.call('getaccountaddress', ['_escrow_pub_' + listingItem.hash]);
        const changeAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_change']);
        const pubkey = (await this.coreRpcService.call('validateaddress', [addr])).pubkey;

        // TODO: enums
        // convert the bid data params as bid data key value pair
        const bidData = this.getBidData(params.concat([
            'outputs', outputs, 'pubkeys', [pubkey], 'changeAddr', changeAddr, 'change', change
        ]));

        this.log.debug('bidData: ', JSON.stringify(bidData, null, 2));

        // fetch the profile
        /*const profileModel = await this.profileService.getDefault();
        const profile = profileModel.toJSON();*/

        this.log.debug('bidder profile: ', JSON.stringify(profile, null, 2));

        // add shipping address to bidData
        /* if (_.isEmpty(profile.ShippingAddresses)) {
            this.log.error('Profile is missing a shipping address.');
            throw new MessageException('Profile is missing a shipping address.');
        } */

        // store the shipping address in biddata
        bidData.push({id: 'ship.firstName', value: shippingAddress.firstName ? shippingAddress.firstName : ''});
        bidData.push({id: 'ship.lastName', value: shippingAddress.lastName ? shippingAddress.lastName : ''});
        bidData.push({id: 'ship.addressLine1', value: shippingAddress.addressLine1});
        bidData.push({id: 'ship.addressLine2', value: shippingAddress.addressLine2});
        bidData.push({id: 'ship.city', value: shippingAddress.city});
        bidData.push({id: 'ship.state', value: shippingAddress.state});
        bidData.push({id: 'ship.zipCode', value: shippingAddress.zipCode});
        bidData.push({id: 'ship.country', value: shippingAddress.country});

        // fetch the market
        const marketModel: Market = await this.marketService.findOne(listingItem.Market.id);
        const market = marketModel.toJSON();

        const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_BID, listingItem.hash, bidData);

        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: bidMessage
        } as MarketplaceMessage;

        this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

        const seller = this.getSeller(listingItem);

        // save bid locally
        const createdBid = await this.createBid(bidMessage, listingItem, profile.address);
        this.log.debug('createdBid:', JSON.stringify(createdBid, null, 2));

        // broadcast the message in to the network
        return await this.smsgService.smsgSend(profile.address, seller, marketPlaceMessage, false);
    }

    /**
     * Accept a Bid
     * todo: add the bid as param, so we know whose bid we are accepting. now supports just one bidder.
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    public async accept(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse> {

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

            this.log.debug('unspent: ', unspent);
            this.log.debug('totalPrice: ', totalPrice);

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

            const addr = await this.coreRpcService.getNewAddress(['_escrow_pub_' + listingItem.hash], false);

            // TODO: Proper change address?!?!
            const changeAddr = await this.coreRpcService.getNewAddress(['_escrow_change'], false);
            const addressInfo = await this.coreRpcService.getAddressInfo(addr);
            const pubkey = addressInfo.pubkey;

            let buyerPubkey = this.getValueFromBidDatas('pubkeys', bid.BidDatas);
            buyerPubkey = buyerPubkey[0] === '[' ? JSON.parse(buyerPubkey)[0] : buyerPubkey;

            this.log.debug('addr: ', addr);
            this.log.debug('changeAddr: ', changeAddr);
            this.log.debug('pubkey: ', pubkey);
            this.log.debug('buyerPubkey: ', buyerPubkey);
            this.log.debug('listingItem.hash: ', listingItem.hash);

            // dataToSave.dataValue = typeof (dataToSave.dataValue) === 'string' ? dataToSave.dataValue : JSON.stringify(dataToSave.dataValue);

            // create Escrow address
            const escrow = await this.coreRpcService.addMultiSigAddress(2, [pubkey, buyerPubkey].sort(), '_escrow_' + listingItem.hash);
            this.log.debug('escrow: ', JSON.stringify(escrow, null, 2));

            // const escrow = (await this.coreRpcService.call('addmultisigaddress', [
            //    2, [pubkey, buyerPubkey].sort(), '_escrow_' + listingItem.hash  // TODO: Something unique??
            //    ]));

            const txout = {};

            txout[escrow.address] = +(totalPrice * 3).toFixed(8); // TODO: Shipping... ;(
            txout[changeAddr] = change;

            const buyerChangeAddr = this.getValueFromBidDatas('changeAddr', bid.BidDatas); // TODO: Error handling - nice messagee..
            let buyerOutputs = this.getValueFromBidDatas('outputs', bid.BidDatas);

            // TODO: Verify that buyers outputs are unspent?? :/
            if (buyerOutputs) {
                sum = 0;
                change = 0;
                buyerOutputs = JSON.parse(buyerOutputs);
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

            const rawtx = await this.coreRpcService.createRawTransaction(outputs.concat(buyerOutputs), txout);

            // const rawtx = await this.coreRpcService.call('createrawtransaction', [
            //    outputs.concat(buyerOutputs),
            //    txout
            // ]);

            this.log.debug('rawtx: ', rawtx);

            // TODO: At this stage we need to store the unsigned transaction, as we will need user interaction to sign
            // the transaction
            const signed = await this.coreRpcService.signRawTransactionWithWallet(rawtx);
            // const signed = await this.coreRpcService.signRawTransactionWithKey(rawtx, TODO );

            // const signed = await this.coreRpcService.call('signrawtransaction', [rawtx]);

            if (!signed || (signed.errors && (
                    signed.errors[0].error !== 'Operation not valid with the current stack size' &&
                    signed.errors[0].error !== 'Unable to sign input, invalid stack size (possibly missing key)'))) {
                this.log.error('Error signing transaction' + signed ? ': ' + signed.errors[0].error : '');
                throw new MessageException('Error signing transaction' + signed ? ': ' + signed.error : '');
            }

            if (signed.complete) {
                this.log.error('Transaction should not be complete at this stage, will not send insecure message');
                throw new MessageException('Transaction should not be complete at this stage, will not send insecure message');
            }

            // TODO: We need to send a refund / release address
            const releaseAddr = await this.coreRpcService.getNewAddress(['_escrow_release'], false);

            // const releaseAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_release']);
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

            // bid accept is sent to the buyer
            const buyer = this.getBuyer(listingItem);

            // broadcast the accepted bid message
            return await this.smsgService.smsgSend(profile.address, buyer, marketPlaceMessage, false);
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
    public async cancel(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse> {

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

            // bid cancel should be sent to seller
            const seller = this.getSeller(listingItem);

            // broadcast the cancel bid message
            return await this.smsgService.smsgSend(profile.address, seller, marketPlaceMessage, false);
        } else {
            this.log.error(`Bid can not be cancelled because it was already been ${bid.action}`);
            throw new MessageException(`Bid can not be cancelled because it was already been ${bid.action}`);
        }
    }

    /**
     * Reject a Bid
     * todo: add the bid as param, so we know whose bid we are rejecting. now supports just one bidder.
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    public async reject(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse> {

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

            // bid reject should be sent to buyer
            const buyer = this.getBuyer(listingItem);

            // broadcast the reject bid message
            return await this.smsgService.smsgSend(profile.address, buyer, marketPlaceMessage, false);
        } else {
            this.log.error(`Bid can not be rejected because it was already been ${bid.action}`);
            throw new MessageException(`Bid can not be rejected because it was already been ${bid.action}`);
        }
    }

    /**
     * process received BidMessage
     * - save ActionMessage
     * - create Bid
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {
        this.log.debug('Received event:', event);

        // todo: fix
        event.smsgMessage.received = new Date().toISOString();

        const bidMessage: BidMessage = event.marketplaceMessage.mpaction as BidMessage;
        const bidder = event.smsgMessage.from;

        const message = event.marketplaceMessage;

        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.item);
        const listingItem = listingItemModel.toJSON();

        // first save it
        this.log.debug('save actionmessage');
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
        const actionMessage = actionMessageModel.toJSON();

        this.log.debug('search for existing bid');
        // TODO: should someone be able to bid more than once?
        const biddersExistingBidsForItem = await this.bidService.search({
            listingItemHash: bidMessage.item,
            bidders: [bidder]
        } as BidSearchParams);


        if (biddersExistingBidsForItem && biddersExistingBidsForItem.length > 0) {
            this.log.debug('biddersExistingBidsForItem:', biddersExistingBidsForItem.length);
            throw new MessageException('Bids allready exist for the ListingItem for the bidder.');
        }

        if (bidMessage) {

            const createdBid = await this.createBid(bidMessage, listingItem, bidder);
            this.log.debug('createdBid:', JSON.stringify(createdBid, null, 2));

            // TODO: do whatever else needs to be done

            return actionMessage;
        } else {
            throw new MessageException('Missing BidMessage');
        }
    }

    /**
     * process received AcceptBidMessage
     * - save ActionMessage
     * - update Bid
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processAcceptBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        const bidMessage: BidMessage = event.marketplaceMessage.mpaction as BidMessage;
        const bidder = event.smsgMessage.from;

        // find the ListingItem
        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }
        const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.item);
        const listingItem = listingItemModel.toJSON();

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
        const actionMessage = actionMessageModel.toJSON();

        if (bidMessage) {

            // find the Bid
            const existingBid = _.find(listingItem.Bids, (o: resources.Bid) => {
                return o.action === BidMessageType.MPA_BID && o.bidder === bidder;
            });

            this.log.debug('existingBid:', existingBid);

            if (existingBid) {
                // create a bid
                const bidUpdateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bidder, existingBid);
                const updatedBid = this.bidService.update(existingBid.id, bidUpdateRequest);

                this.log.debug('updatedBid:', updatedBid);
                // TODO: do whatever else needs to be done

                return actionMessage;
            } else {
                throw new MessageException('There is no existing Bid to accept.');
            }
        } else {
            throw new MessageException('Missing BidMessage.');
        }
    }

    /**
     * process received CancelBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processCancelBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        const bidMessage: BidMessage = event.marketplaceMessage.mpaction as BidMessage;
        const bidder = event.smsgMessage.from;

        // find the ListingItem
        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }
        const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.item);
        const listingItem = listingItemModel.toJSON();

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
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

        // find the ListingItem
        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }
        const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.item);
        const listingItem = listingItemModel.toJSON();

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    private async createBid(bidMessage: BidMessage, listingItem: resources.ListingItem, bidder: string): Promise<resources.Bid> {
        // create a bid
        const bidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bidder);

        // make sure the bids address type is correct
        this.log.debug('found listingItem.id: ', listingItem.id);

        if (!_.isEmpty(listingItem.ListingItemTemplate)) { // local profile is selling
            this.log.debug('listingItem has template: ', listingItem.ListingItemTemplate.id);
            this.log.debug('listingItem template has profile: ', listingItem.ListingItemTemplate.Profile.id);
            bidCreateRequest.address.type = AddressType.SHIPPING_BID;
            bidCreateRequest.address.profile_id = listingItem.ListingItemTemplate.Profile.id;
        } else { // local profile is buying
            this.log.debug('listingItem has no template ');
            this.log.debug('bidder: ', bidder);
            const profileModel = await this.profileService.findOneByAddress(bidder);
            const profile = profileModel.toJSON();
            bidCreateRequest.address.type = AddressType.SHIPPING_OWN;
            bidCreateRequest.address.profile_id = profile.id;
        }

        const createdBidModel = await this.bidService.create(bidCreateRequest);
        const createdBid = createdBidModel.toJSON();
        return createdBid;
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
    private getBidData(data: string[]): any[] {
        const bidData: any[] = [];

        // convert the bid data params as bid data key value pair
        for (let i = 0; i < data.length; i += 2) {
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
        if (value) {
            return value.dataValue;
        } else {
            this.log.error('Missing BidData value for key: ' + key);
            throw new MessageException('Missing BidData value for key: ' + key);
        }
    }

    /**
     * get seller from listingitems MP_ITEM_ADD ActionMessage
     * todo:  refactor
     * @param {"resources".ListingItem} listingItem
     * @returns {Promise<string>}
     */
    private getSeller(listingItem: resources.ListingItem): string {
        for (const actionMessage of listingItem.ActionMessages) {
            if (actionMessage.action === 'MP_ITEM_ADD') {
                return actionMessage.MessageData.from;
            }
        }
        throw new MessageException('Seller not found for ListingItem.');

    }

    /**
     * get seller from listingitems MP_ITEM_ADD ActionMessage
     * todo:  refactor
     * @param {"resources".ListingItem} listingItem
     * @returns {Promise<string>}
     */
    private getBuyer(listingItem: resources.ListingItem): string {
        for (const actionMessage of listingItem.ActionMessages) {
            if (actionMessage.action === 'MPA_BID') {
                return actionMessage.MessageData.from;
            }
        }
        throw new MessageException('Buyer not found for ListingItem.');
    }


}
