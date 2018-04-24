import * as Bookshelf from 'bookshelf';
import { ListingItemObjectData } from '../models/ListingItemObjectData';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ListingItemObjectDataRepository {
    ListingItemObjectDataModel: typeof ListingItemObjectData;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ListingItemObjectDataModel: typeof ListingItemObjectData, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ListingItemObjectData>>;
    findOne(id: number, withRelated?: boolean): Promise<ListingItemObjectData>;
    create(data: any): Promise<ListingItemObjectData>;
    update(id: number, data: any): Promise<ListingItemObjectData>;
    destroy(id: number): Promise<void>;
}
