import * as Bookshelf from 'bookshelf';
import { ItemPrice } from '../models/ItemPrice';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ItemPriceRepository {
    ItemPriceModel: typeof ItemPrice;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ItemPriceModel: typeof ItemPrice, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemPrice>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemPrice>;
    create(data: any): Promise<ItemPrice>;
    update(id: number, data: any): Promise<ItemPrice>;
    destroy(id: number): Promise<void>;
}
