import * as Bookshelf from 'bookshelf';
import { ListingItemObject } from '../models/ListingItemObject';
import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemObjectSearchParams } from '../requests/ListingItemObjectSearchParams';
export declare class ListingItemObjectRepository {
    ListingItemObjectModel: typeof ListingItemObject;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ListingItemObjectModel: typeof ListingItemObject, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ListingItemObject>>;
    findOne(id: number, withRelated?: boolean): Promise<ListingItemObject>;
    /**
     *
     * @param options, ListingItemObjectSearchParams
     * @returns {Promise<Bookshelf.Collection<ListingItemObject>>}
     */
    search(options: ListingItemObjectSearchParams): Promise<Bookshelf.Collection<ListingItemObject>>;
    create(data: any): Promise<ListingItemObject>;
    update(id: number, data: any): Promise<ListingItemObject>;
    destroy(id: number): Promise<void>;
}
