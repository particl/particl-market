import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ItemLocationRepository } from '../repositories/ItemLocationRepository';
import { ItemLocation } from '../models/ItemLocation';
import { ItemLocationCreateRequest } from '../requests/ItemLocationCreateRequest';
import { ItemLocationUpdateRequest } from '../requests/ItemLocationUpdateRequest';
import { LocationMarkerService } from './LocationMarkerService';
export declare class ItemLocationService {
    locationMarkerService: LocationMarkerService;
    itemLocationRepo: ItemLocationRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(locationMarkerService: LocationMarkerService, itemLocationRepo: ItemLocationRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemLocation>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemLocation>;
    create(data: ItemLocationCreateRequest): Promise<ItemLocation>;
    update(id: number, data: ItemLocationUpdateRequest): Promise<ItemLocation>;
    destroy(id: number): Promise<void>;
}
