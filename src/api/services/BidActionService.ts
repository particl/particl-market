import * as _ from 'lodash';
import * as Bookshelf from 'bookshelf';
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
import { Profile } from '../models/Profile';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { Output } from 'resources';
import { BidMessage } from '../messages/BidMessage';
import { BidSearchParams } from '../requests/BidSearchParams';
import { AddressType } from '../enums/AddressType';
import { SearchOrder } from '../enums/SearchOrder';
import { Environment } from '../../core/helpers/Environment';
import { OrderFactory } from '../factories/OrderFactory';
import { OrderService } from './OrderService';
import { BidUpdateRequest } from '../requests/BidUpdateRequest';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import { Bid } from '../models/Bid';

declare function escape(s: string): string;
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
        @inject(Types.Service) @named(Targets.Service.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.OrderFactory) private orderFactory: OrderFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Profile} bidderProfile
     * @param {"resources".Address} shippingAddress
     * @param {any[]} additionalParams
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send(listingItem: resources.ListingItem, bidderProfile: resources.Profile,
                      shippingAddress: resources.Address, additionalParams: any[]): Promise<SmsgSendResponse> {

        // TODO: change send params to BidSendRequest and @validate them

        // TODO: some of this stuff could propably be moved to the factory
        // TODO: Create new unspent RPC call for unspent outputs that came out of a RingCT transaction

        // generate bidDatas
        const bidDatas = await this.generateBidDatasForMPA_BID(listingItem, shippingAddress, additionalParams);

        this.log.debug('bidder profile: ', JSON.stringify(bidderProfile, null, 2));

        // create MPA_BID
        const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_BID, listingItem.hash, bidDatas);

        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: bidMessage
        } as MarketplaceMessage;

        this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

        // save bid locally before broadcasting
        const createdBid = await this.createBid(bidMessage, listingItem, bidderProfile.address);
        this.log.debug('createdBid:', JSON.stringify(createdBid, null, 2));

        // broadcast the message in to the network
        return await this.smsgService.smsgSend(bidderProfile.address, listingItem.seller, marketPlaceMessage, false);
    }

    /**
     *
     * @param {"resources".ListingItem} listingItem
     * @returns {Promise<any[]>}
     */
    public async generateBidDatasForMPA_BID(
        listingItem: resources.ListingItem,
        shippingAddress: resources.Address,
        additionalParams: any[]
    ): Promise<any[]> {

        // Get unspent
        // const unspent = await this.coreRpcService.call('listunspent', [1, 99999999, [], false]);
        const unspent = await this.coreRpcService.listUnspent(1, 99999999, [], false);

        if (!unspent || unspent.length === 0) {
            this.log.warn('No unspent outputs');
            throw new MessageException('No unspent outputs');
        }
        this.log.debug('unspent outputs: ', unspent.length);

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

        // changed to getNewAddress, since getaccountaddress doesn't return address which we can get the pubkey from
        const addr = await this.coreRpcService.getNewAddress(['_escrow_pub_' + listingItem.hash], false);
        // const addr = await this.coreRpcService.getAccountAddress('_escrow_pub_' + listingItem.hash);
        // const addr = await this.coreRpcService.call('getaccountaddress', ['_escrow_pub_' + listingItem.hash]);
        this.log.debug('addr: ', addr);

        const changeAddr = await this.coreRpcService.getNewAddress(['_escrow_change'], false);
        // const changeAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_change']);
        this.log.debug('changeAddr: ', changeAddr);

        // TODO: this is not on 0.16.0.3 yet ...
        // const addressInfo = await this.coreRpcService.getAddressInfo(addr);
        // this.log.debug('addressInfo: ', JSON.stringify(addressInfo, null, 2));
        // const pubkey = addressInfo.pubkey;

        // 0.16.0.3
        const validateAddress = await this.coreRpcService.validateAddress(addr);
        this.log.debug('validateAddress: ', JSON.stringify(validateAddress, null, 2));
        const pubkey = validateAddress.pubkey;

        // const pubkey = (await this.coreRpcService.call('validateaddress', [addr])).pubkey;

        if (!pubkey) {
            throw new MessageException('Could not get public key for address!');
        }

        // convert the bid data params as bid data key value pair
        const bidDatas = this.getBidDatasFromArray(additionalParams.concat([
            'outputs', outputs,
            'pubkeys', [pubkey],
            'changeAddr', changeAddr,
            'change', change
        ]));

        this.log.debug('bidDatas: ', JSON.stringify(bidDatas, null, 2));

        // store the shipping address in biddata
        bidDatas.push({id: 'ship.firstName', value: shippingAddress.firstName ? shippingAddress.firstName : ''});
        bidDatas.push({id: 'ship.lastName', value: shippingAddress.lastName ? shippingAddress.lastName : ''});
        bidDatas.push({id: 'ship.addressLine1', value: shippingAddress.addressLine1});
        bidDatas.push({id: 'ship.addressLine2', value: shippingAddress.addressLine2});
        bidDatas.push({id: 'ship.city', value: shippingAddress.city});
        bidDatas.push({id: 'ship.state', value: shippingAddress.state});
        bidDatas.push({id: 'ship.zipCode', value: shippingAddress.zipCode});
        bidDatas.push({id: 'ship.country', value: shippingAddress.country});

        return bidDatas;
    }

    /**
     * Accept a Bid
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    public async accept(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse> {

        // last bids action needs to be MPA_BID
        if (bid.action === BidMessageType.MPA_BID) {

            // todo: create order before biddatas so order hash can be added to biddata in generateBidDatasForMPA_ACCEPT
            // generate bidDatas
            const bidDatas = await this.generateBidDatasForMPA_ACCEPT(listingItem, bid);

            // create the bid accept message
            const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_ACCEPT, listingItem.hash, bidDatas);

            // update the bid locally
            const bidUpdateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bid.bidder, bid);
            const updatedBidModel = await this.bidService.update(bid.id, bidUpdateRequest);
            const updatedBid = updatedBidModel.toJSON();
            // this.log.debug('updatedBid:', JSON.stringify(updatedBid, null, 2));

            // create the order
            const orderCreateRequest = await this.orderFactory.getModelFromBid(updatedBid);
            const orderModel = await this.orderService.create(orderCreateRequest);
            const order = orderModel.toJSON();

            this.log.debug('send(), created Order: ', order);

            // add Order.hash to bidData
            bidMessage.objects = bidMessage.objects ? bidMessage.objects : [];
            bidMessage.objects.push({id: 'orderHash', value: order.hash});

            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            } as MarketplaceMessage;

            this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

            // broadcast the accepted bid message
            return await this.smsgService.smsgSend(listingItem.seller, updatedBid.bidder, marketPlaceMessage, false);

        } else {
            this.log.error(`Bid can not be accepted because its state allready is ${bid.action}`);
            throw new MessageException(`Bid can not be accepted because its state already is ${bid.action}`);
        }
    }

    /**
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @param {boolean} testRun
     * @returns {Promise<any[]>}
     */
    public async generateBidDatasForMPA_ACCEPT(
        listingItem: resources.ListingItem,
        bid: resources.Bid,
        testRun: boolean = false
    ): Promise<any[]> {

        // TODO: Ryno Hacks - Refactor code below...
        // This is a copy and paste - hacks hacks hacks ;(
        // Get unspent
        const unspent = await this.coreRpcService.listUnspent(1, 99999999, [], false);
        // const unspent = await this.coreRpcService.call('listunspent', [1, 99999999, [], false]);

        const outputs: Output[] = [];
        const listingItemPrice = listingItem.PaymentInformation.ItemPrice;
        const basePrice = listingItemPrice.basePrice;
        const shippingPriceMax = Math.max(
            listingItemPrice.ShippingPrice.international,
            listingItemPrice.ShippingPrice.domestic);
        const totalPrice = basePrice + shippingPriceMax; // TODO: Determine if local or international...
        let sum = 0;
        let change = 0;

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

        // TODO: this is not on 0.16.0.3 yet ...
        // const addressInfo = await this.coreRpcService.getAddressInfo(addr);
        // this.log.debug('addressInfo: ', JSON.stringify(addressInfo, null, 2));
        // const pubkey = addressInfo.pubkey;

        // 0.16.0.3
        const validateAddress = await this.coreRpcService.validateAddress(addr);
        this.log.debug('validateAddress: ', JSON.stringify(validateAddress, null, 2));
        const pubkey = validateAddress.pubkey;

        let buyerPubkey = this.getValueFromBidDatas('pubkeys', bid.BidDatas);
        buyerPubkey = buyerPubkey[0] === '[' ? JSON.parse(buyerPubkey)[0] : buyerPubkey;

        if (!buyerPubkey) {
            throw new MessageException('Buyer public key was null!');
        }

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

        this.log.debug('buyerOutputs: ', buyerOutputs);

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

        // TODO: this is not on 0.16.0.3 yet ...
        // let signed;
        // if (Environment.isDevelopment() || Environment.isTest()) {
        //    const privKey = await this.coreRpcService.dumpPrivKey(addr);
        //    signed = await this.coreRpcService.signRawTransactionWithKey(rawtx, [privKey]);
        // } else {
        //    signed = await this.coreRpcService.signRawTransactionWithWallet(rawtx);
        // }

        // 0.16.0.3
        const signed = await this.coreRpcService.signRawTransaction(rawtx);
        // const signed = await this.coreRpcService.call('signrawtransaction', [rawtx]);

        this.log.debug('signed: ', JSON.stringify(signed, null, 2));

        if (!signed || (signed.errors && (
                signed.errors[0].error !== 'Operation not valid with the current stack size' &&
                signed.errors[0].error !== 'Unable to sign input, invalid stack size (possibly missing key)'))) {
            this.log.error('Error signing transaction' + signed ? ': ' + signed.errors[0].error : '');
            throw new MessageException('Error signing transaction' + signed ? ': ' + signed.error : '');
        }

        // when testRun is true, we are calling this from the tests and we just skip this
        // todo: make it possible to run tests on one particld
        if (signed.complete && testRun === false) {
            this.log.error('Transaction should not be complete at this stage, will not send insecure message');
            throw new MessageException('Transaction should not be complete at this stage, will not send insecure message');
        }

        // TODO: We need to send a refund / release address
        const releaseAddr = await this.coreRpcService.getNewAddress(['_escrow_release'], false);

        // - Most likely the transaction building and signing will happen in a different command that takes place
        // before this..
        // End - Ryno Hacks

        // const releaseAddr = await this.coreRpcService.call('getnewaddress', ['_escrow_release']);
        // TODO: address should be named releaseAddress or sellerReleaseAddress and all keys should be enums,
        // it's confusing when on escrowactionservice this 'address' is referred to as sellers address which it is not
        const bidDatas = this.getBidDatasFromArray(['pubkeys', [pubkey, buyerPubkey].sort(), 'rawtx', signed.hex, 'address', releaseAddr]);

        return bidDatas;
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

            // create the bid cancel message
            const bidMessage: BidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_CANCEL, listingItem.hash);

            // Update the bid in the database with new action.
            const tmpBidCreateRequest: BidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bid.bidder, bid);
            const bidUpdateRequest: BidUpdateRequest = {
                listing_item_id: tmpBidCreateRequest.listing_item_id,
                action: BidMessageType.MPA_CANCEL,
                bidder: tmpBidCreateRequest.bidder,
                bidDatas: tmpBidCreateRequest.bidDatas
            } as BidUpdateRequest;
            const retBid = await this.bidService.update(bid.id, bidUpdateRequest);

            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            } as MarketplaceMessage;

            this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

            // broadcast the cancel bid message
            return await this.smsgService.smsgSend(bid.bidder, listingItem.seller, marketPlaceMessage, false);
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
            // fetch the seller profile
            const sellerProfileModel: Profile = await this.profileService.findOneByAddress(listingItem.seller);
            if (!sellerProfileModel) {
                this.log.error('Seller profile not found. We aren\'t the seller?');
                throw new MessageException('Seller profile not found. We aren\'t the seller?');
            }
            const sellerProfile = sellerProfileModel.toJSON();

            // create the bid reject message
            const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_REJECT, listingItem.hash);

            // Update the bid in the database with new action.
            const tmpBidCreateRequest: BidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bid.bidder, bid);
            const bidUpdateRequest: BidUpdateRequest = {
                listing_item_id: tmpBidCreateRequest.listing_item_id,
                action: BidMessageType.MPA_REJECT,
                bidder: tmpBidCreateRequest.bidder,
                bidDatas: tmpBidCreateRequest.bidDatas
            } as BidUpdateRequest;
            const retBid = await this.bidService.update(bid.id, bidUpdateRequest);

            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            } as MarketplaceMessage;

            this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

            // broadcast the reject bid message
            return await this.smsgService.smsgSend(sellerProfile.address, bid.bidder, marketPlaceMessage, false);
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
    public async processBidReceivedEvent(event: MarketplaceEvent): Promise<resources.Bid> {
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
        // TODO: for that to be possible, we need to be able to identify different bids from one address
        // -> needs bid.hash
        // TODO: when testing locally, bid gets created first for the bidder after which it can be found here when receiving the bid

        const biddersExistingBidsForItem = await this.bidService.search({
            listingItemHash: bidMessage.item,
            bidders: [bidder]
        } as BidSearchParams);

        this.log.debug('biddersExistingBidsForItem:', JSON.stringify(biddersExistingBidsForItem, null, 2));

        if (biddersExistingBidsForItem && biddersExistingBidsForItem.length > 0) {
            this.log.debug('biddersExistingBidsForItem:', biddersExistingBidsForItem.length);
            throw new MessageException('Bids allready exist for the ListingItem for the bidder.');
        }

        if (bidMessage) {
            const createdBid = await this.createBid(bidMessage, listingItem, bidder);
            this.log.debug('createdBid:', JSON.stringify(createdBid, null, 2));

            // TODO: do whatever else needs to be done

            return createdBid;
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
    public async processAcceptBidReceivedEvent(event: MarketplaceEvent): Promise<resources.Bid> {

        this.log.debug('Received event:', event);

        const bidMessage: BidMessage = event.marketplaceMessage.mpaction as BidMessage;
        const bidder = event.smsgMessage.to; // from seller to buyer

        // find the ListingItem
        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }
        const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.item);
        const listingItem = listingItemModel.toJSON();

        // delete listingItem.ItemInformation.ItemImages;
        // this.log.debug('listingItem:', JSON.stringify(listingItem, null, 2));
        // this.log.debug('bidder:', bidder);

        // TODO: save incoming and outgoing actionmessages
        // TODO: ... and do it in one place
        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
        const actionMessage = actionMessageModel.toJSON();

        if (bidMessage) {

            // find the Bid
            const existingBid = _.find(listingItem.Bids, (o: resources.Bid) => {
                return o.action === BidMessageType.MPA_BID && o.bidder === bidder;
            });

            this.log.debug('existingBid:', JSON.stringify(existingBid, null, 2));

            if (existingBid) {
                // create a bid
                const bidUpdateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bidder, existingBid);
                // this.log.debug('bidUpdateRequest:', JSON.stringify(bidUpdateRequest, null, 2));

                // update the bid locally
                const updatedBidModel = await this.bidService.update(existingBid.id, bidUpdateRequest);
                let updatedBid: resources.Bid = updatedBidModel.toJSON();
                this.log.debug('updatedBid:', JSON.stringify(updatedBid, null, 2));

                // create the order from the bid
                const orderCreateRequest = await this.orderFactory.getModelFromBid(updatedBid);
                const orderModel = await this.orderService.create(orderCreateRequest);
                const order = orderModel.toJSON();

                this.log.debug('processAcceptBidReceivedEvent(), created Order: ', JSON.stringify(order, null, 2));

                const orderHash = this.getValueFromBidDatas('orderHash', updatedBid.BidDatas);
                this.log.debug('seller orderHash: ', orderHash);
                this.log.debug('local orderHash: ', order.hash);

                await updatedBidModel.fetch({withRelated: ['OrderItem']});
                updatedBid = updatedBidModel.toJSON();
                // TODO: do whatever else needs to be done

                // this.log.debug('processAcceptBidReceivedEvent(), updatedBid: ', JSON.stringify(updatedBid, null, 2));

                return updatedBid;
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
        const bidMessage: any = event.marketplaceMessage.mpaction as BidMessage;
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

        // Get latest bid from listingItemId and bidder so we can get bidId.
        const params: BidSearchParams = new BidSearchParams({
            listingItemId: listingItem.id,
            action: BidMessageType.MPA_BID,
            bidders: [ bidder ],
            ordering: SearchOrder.DESC
        });
        const oldBids: Bookshelf.Collection<Bid> = await this.bidService.search(params);
        let oldBid: any = oldBids.pop();
        if (!oldBid) {
            throw new MessageException('Missing old bid.');
        }
        oldBid = oldBid.toJSON();

        // Update the bid in the database with new action.
        const tmpBidCreateRequest: BidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bidder, oldBid);
        const bidUpdateRequest: BidUpdateRequest = {
            listing_item_id: tmpBidCreateRequest.listing_item_id,
            action: BidMessageType.MPA_CANCEL,
            bidder: tmpBidCreateRequest.bidder,
            bidDatas: tmpBidCreateRequest.bidDatas
        } as BidUpdateRequest;
        const retBid = await this.bidService.update(oldBid.id, bidUpdateRequest);

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

        this.log.info('Received event:', event);
        const message = event.marketplaceMessage;
        const bidMessage: any = message.mpaction as BidMessage;
        const bidder = event.smsgMessage.to;

        // find the ListingItem
        if (!bidMessage) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }
        const listingItemModel = await this.listingItemService.findOneByHash(bidMessage.item);
        const listingItem = listingItemModel.toJSON();

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
        const actionMessage = actionMessageModel.toJSON();

        // Get latest bid from listingItemId and bidder so we can get bidId.
        const params: BidSearchParams = new BidSearchParams({
            listingItemId: listingItem.id,
            action: BidMessageType.MPA_BID,
            bidders: [ bidder ],
            ordering: SearchOrder.DESC
        });
        const oldBids: Bookshelf.Collection<Bid> = await this.bidService.search(params);
        let oldBid: any = oldBids.pop();
        if (!oldBid) {
            throw new MessageException('Missing old bid.');
        }
        oldBid = oldBid.toJSON();

        // Update the bid in the database with new action.
        const tmpBidCreateRequest: BidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bidder, oldBid);
        const bidUpdateRequest: BidUpdateRequest = {
            listing_item_id: tmpBidCreateRequest.listing_item_id,
            action: BidMessageType.MPA_REJECT,
            bidder: tmpBidCreateRequest.bidder,
            bidDatas: tmpBidCreateRequest.bidDatas
        } as BidUpdateRequest;
        const retBid = await this.bidService.update(oldBid.id, bidUpdateRequest);

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
    private getBidDatasFromArray(data: string[]): any[] {
        const bidDatas: any[] = [];

        // convert the bid data params as bid data key value pair
        for (let i = 0; i < data.length; i += 2) {
            bidDatas.push({id: data[i], value: data[i + 1]});
        }
        return bidDatas;
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
    private getBuyer(listingItem: resources.ListingItem): string {
        for (const actionMessage of listingItem.ActionMessages) {
            if (actionMessage.action === 'MPA_BID') {
                return actionMessage.MessageData.from;
            }
        }
        throw new MessageException('Buyer not found for ListingItem.');
    }


}
