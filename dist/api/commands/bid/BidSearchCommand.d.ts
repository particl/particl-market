import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { BidService } from '../../services/BidService';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Bid } from '../../models/Bid';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class BidSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Bid>> {
    Logger: typeof LoggerType;
    private bidService;
    private listingItemService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, bidService: BidService, listingItemService: ListingItemService);
    /**
     *
     * data.params[]:
     * [0]: ListingItem hash, string, * for all
     * [1]: status/action, ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL}, * for all
     * [2]: ordering ASC/DESC, orders by createdAt
     * [3...]: bidder: particl address
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<Bid>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
