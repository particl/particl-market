import { Logger as LoggerType } from '../../core/Logger';
import { BidMessage } from '../messages/BidMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import * as resources from 'resources';
export declare class BidFactory {
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    /**
     *
     * @param {BidMessageType} bidMessageType
     * @param {string} itemHash
     * @param {any[]} idValuePairObjects { id: 'objectid', value: 'objectvalue' }
     * @returns {Promise<BidMessage>}
     */
    getMessage(bidMessageType: BidMessageType, itemHash: string, idValuePairObjects?: any[]): Promise<BidMessage>;
    /**
     * create a BidCreateRequest
     *
     * @param {BidMessage} bidMessage
     * @param {number} listingItemId
     * @param {string} bidder
     * @param {"resources".Bid} latestBid
     * @returns {Promise<BidCreateRequest>}
     */
    getModel(bidMessage: BidMessage, listingItemId: number, bidder: string, latestBid?: resources.Bid): Promise<BidCreateRequest>;
    /**
     * Checks if the action in the given BidMessage is valid for the latest bid
     *
     * @param bidMessage
     * @param latestBid
     * @returns {boolean}
     */
    private checkBidMessageActionValidity(bidMessage, latestBid?);
    /**
     * todo: refactor duplicate code
     * @param {string} key
     * @param {"resources".BidData[]} bidDatas
     * @returns {any}
     */
    private getValueFromBidDatas(key, bidDatas);
}
