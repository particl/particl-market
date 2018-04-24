import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ListingItemSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItem>> {
    Logger: typeof LoggerType;
    listingItemService: ListingItemService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemService: ListingItemService);
    /**
     * data.params[]:
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: category, number|string, if string, try to find using key, can be null
     *  [4]: type (FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL)
     *  [5]: profileId, (NUMBER | OWN | ALL | *)
     *  [6]: minPrice, number to search item basePrice between 2 range
     *  [7]: maxPrice, number to search item basePrice between 2 range
     *  [8]: country, string, can be null
     *  [9]: shippingDestination, string, can be null
     *  [10]: searchString, string, can be null
     *  [11]: withRelated, boolean
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<ListingItem>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
