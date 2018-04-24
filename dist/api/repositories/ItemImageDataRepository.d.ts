import * as Bookshelf from 'bookshelf';
import { ItemImageData } from '../models/ItemImageData';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ItemImageDataRepository {
    ItemImageDataModel: typeof ItemImageData;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ItemImageDataModel: typeof ItemImageData, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemImageData>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemImageData>;
    create(data: any): Promise<ItemImageData>;
    update(id: number, data: any): Promise<ItemImageData>;
    destroy(id: number): Promise<void>;
}
