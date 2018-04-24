import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemObjectDataRepository } from '../repositories/ListingItemObjectDataRepository';
import { ListingItemObjectData } from '../models/ListingItemObjectData';
import { ListingItemObjectDataCreateRequest } from '../requests/ListingItemObjectDataCreateRequest';
import { ListingItemObjectDataUpdateRequest } from '../requests/ListingItemObjectDataUpdateRequest';
export declare class ListingItemObjectDataService {
    listingItemObjectDataRepo: ListingItemObjectDataRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(listingItemObjectDataRepo: ListingItemObjectDataRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ListingItemObjectData>>;
    findOne(id: number, withRelated?: boolean): Promise<ListingItemObjectData>;
    create(body: ListingItemObjectDataCreateRequest): Promise<ListingItemObjectData>;
    update(id: number, body: ListingItemObjectDataUpdateRequest): Promise<ListingItemObjectData>;
    destroy(id: number): Promise<void>;
}
