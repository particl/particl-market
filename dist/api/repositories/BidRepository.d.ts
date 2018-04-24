import * as Bookshelf from 'bookshelf';
import { Bid } from '../models/Bid';
import { Logger as LoggerType } from '../../core/Logger';
import { BidSearchParams } from '../requests/BidSearchParams';
export declare class BidRepository {
    BidModel: typeof Bid;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(BidModel: typeof Bid, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<Bid>>;
    findOne(id: number, withRelated?: boolean): Promise<Bid>;
    /**
     * todo: optionally fetch withRelated
     *
     * @param options, BidSearchParams
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    search(options: BidSearchParams, withRelated: boolean): Promise<Bookshelf.Collection<Bid>>;
    getLatestBid(listingItemId: number, bidder: string): Promise<Bid>;
    create(data: any): Promise<Bid>;
    update(id: number, data: any): Promise<Bid>;
    destroy(id: number): Promise<void>;
}
