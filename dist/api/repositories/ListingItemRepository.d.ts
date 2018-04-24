import * as Bookshelf from 'bookshelf';
import { ListingItem } from '../models/ListingItem';
import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemSearchParams } from '../requests/ListingItemSearchParams';
export declare class ListingItemRepository {
    ListingItemModel: typeof ListingItem;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ListingItemModel: typeof ListingItem, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ListingItem>>;
    findByCategory(categoryId: number, withRelated?: boolean): Promise<Bookshelf.Collection<ListingItem>>;
    findOne(id: number, withRelated?: boolean): Promise<ListingItem>;
    /**
     *
     * @param {string} hash
     * @param {boolean} withRelated
     * @returns {Promise<ListingItem>}
     */
    findOneByHash(hash: string, withRelated?: boolean): Promise<ListingItem>;
    /**
     *
     * @param {ListingItemSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<ListingItem>>}
     */
    search(options: ListingItemSearchParams, withRelated: boolean): Promise<Bookshelf.Collection<ListingItem>>;
    create(data: any): Promise<ListingItem>;
    update(id: number, data: any): Promise<ListingItem>;
    destroy(id: number): Promise<void>;
}
