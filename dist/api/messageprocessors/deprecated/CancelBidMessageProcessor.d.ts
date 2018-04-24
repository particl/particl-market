/// <reference types="node" />
import { Logger as LoggerType } from '../../../core/Logger';
import { MessageProcessorInterface } from '../MessageProcessorInterface';
import { BidMessage } from '../../messages/BidMessage';
import { Bid } from '../../models/Bid';
import { ListingItemService } from '../../services/ListingItemService';
import { BidService } from '../../services/BidService';
import { BidFactory } from '../../factories/BidFactory';
import { EventEmitter } from '../../../core/api/events';
export declare class CancelBidMessageProcessor implements MessageProcessorInterface {
    private bidFactory;
    private bidService;
    private listingItemService;
    eventEmitter: EventEmitter;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(bidFactory: BidFactory, bidService: BidService, listingItemService: ListingItemService, eventEmitter: EventEmitter, Logger: typeof LoggerType);
    /**
     * Process BidMessage of type MPA-CANCEL
     *
     * data:
     *  action: action of the BidMessage
     *  item: item hash
     *
     * @returns {Promise<Bid>}
     */
    process(data: BidMessage): Promise<Bid>;
}
