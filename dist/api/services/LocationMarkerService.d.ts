import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { LocationMarkerRepository } from '../repositories/LocationMarkerRepository';
import { LocationMarker } from '../models/LocationMarker';
import { LocationMarkerCreateRequest } from '../requests/LocationMarkerCreateRequest';
import { LocationMarkerUpdateRequest } from '../requests/LocationMarkerUpdateRequest';
export declare class LocationMarkerService {
    locationMarkerRepo: LocationMarkerRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(locationMarkerRepo: LocationMarkerRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<LocationMarker>>;
    findOne(id: number, withRelated?: boolean): Promise<LocationMarker>;
    create(body: LocationMarkerCreateRequest): Promise<LocationMarker>;
    update(id: number, body: LocationMarkerUpdateRequest): Promise<LocationMarker>;
    destroy(id: number): Promise<void>;
}
