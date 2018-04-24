import * as Bookshelf from 'bookshelf';
import { LocationMarker } from '../models/LocationMarker';
import { Logger as LoggerType } from '../../core/Logger';
export declare class LocationMarkerRepository {
    LocationMarkerModel: typeof LocationMarker;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(LocationMarkerModel: typeof LocationMarker, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<LocationMarker>>;
    findOne(id: number, withRelated?: boolean): Promise<LocationMarker>;
    create(data: any): Promise<LocationMarker>;
    update(id: number, data: any): Promise<LocationMarker>;
    destroy(id: number): Promise<void>;
}
