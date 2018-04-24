import * as Bookshelf from 'bookshelf';
import { ItemLocation } from '../models/ItemLocation';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ItemLocationRepository {
    ItemLocationModel: typeof ItemLocation;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ItemLocationModel: typeof ItemLocation, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemLocation>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemLocation>;
    create(data: any): Promise<ItemLocation>;
    update(id: number, data: any): Promise<ItemLocation>;
    destroy(id: number): Promise<void>;
}
