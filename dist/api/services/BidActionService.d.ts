/// <reference types="node" />
import { Logger as LoggerType } from '../../core/Logger';
import * as resources from 'resources';
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
import { OrderFactory } from '../factories/OrderFactory';
import { OrderService } from './OrderService';
import { BidDataService } from './BidDataService';
export declare class BidActionService {
    private listingItemService;
    marketService: MarketService;
    actionMessageService: ActionMessageService;
    profileService: ProfileService;
    smsgService: SmsgService;
    bidService: BidService;
    bidDataService: BidDataService;
    orderService: OrderService;
    private coreRpcService;
    private bidFactory;
    private orderFactory;
    eventEmitter: EventEmitter;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(listingItemService: ListingItemService, marketService: MarketService, actionMessageService: ActionMessageService, profileService: ProfileService, smsgService: SmsgService, bidService: BidService, bidDataService: BidDataService, orderService: OrderService, coreRpcService: CoreRpcService, bidFactory: BidFactory, orderFactory: OrderFactory, eventEmitter: EventEmitter, Logger: typeof LoggerType);
    /**
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Profile} bidderProfile
     * @param {"resources".Address} shippingAddress
     * @param {any[]} additionalParams
     * @returns {Promise<SmsgSendResponse>}
     */
    send(listingItem: resources.ListingItem, bidderProfile: resources.Profile, shippingAddress: resources.Address, additionalParams: any[]): Promise<SmsgSendResponse>;
    /**
     *
     * @param {"resources".ListingItem} listingItem
     * @returns {Promise<any[]>}
     */
    generateBidDatasForMPA_BID(listingItem: resources.ListingItem, shippingAddress: resources.Address, additionalParams: any[]): Promise<any[]>;
    /**
     * Accept a Bid
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    accept(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse>;
    /**
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @param {boolean} testRun
     * @returns {Promise<any[]>}
     */
    generateBidDatasForMPA_ACCEPT(listingItem: resources.ListingItem, bid: resources.Bid, testRun?: boolean): Promise<any[]>;
    /**
     * Cancel a Bid
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    cancel(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse>;
    /**
     * Reject a Bid
     * todo: add the bid as param, so we know whose bid we are rejecting. now supports just one bidder.
     *
     * @param {"resources".ListingItem} listingItem
     * @param {"resources".Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    reject(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse>;
    /**
     * process received BidMessage
     * - save ActionMessage
     * - create Bid
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    processBidReceivedEvent(event: MarketplaceEvent): Promise<resources.Bid>;
    /**
     * process received AcceptBidMessage
     * - save ActionMessage
     * - update Bid
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    processAcceptBidReceivedEvent(event: MarketplaceEvent): Promise<resources.Bid>;
    /**
     * process received CancelBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    processCancelBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage>;
    /**
     * process received RejectBidMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ActionMessage>}
     */
    processRejectBidReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage>;
    private createBid(bidMessage, listingItem, bidder);
    private configureEventListeners();
    /**
     * data[]:
     * [0]: id, string
     * [1]: value, string
     * [2]: id, string
     * [3]: value, string
     * ..........
     */
    private getBidDatasFromArray(data);
    /**
     *
     * @param {string} key
     * @param {"resources".BidData[]} bidDatas
     * @returns {any}
     */
    private getValueFromBidDatas(key, bidDatas);
    /**
     * get seller from listingitems MP_ITEM_ADD ActionMessage
     * todo:  refactor
     * @param {"resources".ListingItem} listingItem
     * @returns {Promise<string>}
     */
    private getBuyer(listingItem);
}
