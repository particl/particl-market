import * as Bookshelf from 'bookshelf';
import { ShippingPrice } from '../models/ShippingPrice';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ShippingPriceRepository {
    ShippingPriceModel: typeof ShippingPrice;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ShippingPriceModel: typeof ShippingPrice, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ShippingPrice>>;
    findOne(id: number, withRelated?: boolean): Promise<ShippingPrice>;
    create(data: any): Promise<ShippingPrice>;
    update(id: number, data: any): Promise<ShippingPrice>;
    destroy(id: number): Promise<void>;
}
