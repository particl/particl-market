import * as Bookshelf from 'bookshelf';
import { ItemImage } from '../models/ItemImage';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ItemImageRepository {
    ItemImageModel: typeof ItemImage;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ItemImageModel: typeof ItemImage, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemImage>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemImage>;
    create(data: any): Promise<ItemImage>;
    update(id: number, data: any): Promise<ItemImage>;
    destroy(id: number): Promise<void>;
}
