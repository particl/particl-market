import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemObjectRepository } from '../repositories/ListingItemObjectRepository';
import { ListingItemObject } from '../models/ListingItemObject';
import { ListingItemObjectCreateRequest } from '../requests/ListingItemObjectCreateRequest';
import { ListingItemObjectUpdateRequest } from '../requests/ListingItemObjectUpdateRequest';
import { ListingItemObjectSearchParams } from '../requests/ListingItemObjectSearchParams';
import { ListingItemObjectDataService } from './ListingItemObjectDataService';
export declare class ListingItemObjectService {
    private listingItemObjectDataService;
    listingItemObjectRepo: ListingItemObjectRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(listingItemObjectDataService: ListingItemObjectDataService, listingItemObjectRepo: ListingItemObjectRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ListingItemObject>>;
    findOne(id: number, withRelated?: boolean): Promise<ListingItemObject>;
    /**
     * search ListingItemObject using given ListingItemObjectSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItemObject>>}
     */
    search(options: ListingItemObjectSearchParams): Promise<Bookshelf.Collection<ListingItemObject>>;
    create(data: ListingItemObjectCreateRequest): Promise<ListingItemObject>;
    update(id: number, data: ListingItemObjectUpdateRequest): Promise<ListingItemObject>;
    destroy(id: number): Promise<void>;
}
