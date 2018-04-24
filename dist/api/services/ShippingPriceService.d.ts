import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ShippingPriceRepository } from '../repositories/ShippingPriceRepository';
import { ShippingPrice } from '../models/ShippingPrice';
import { ShippingPriceCreateRequest } from '../requests/ShippingPriceCreateRequest';
import { ShippingPriceUpdateRequest } from '../requests/ShippingPriceUpdateRequest';
export declare class ShippingPriceService {
    shippingPriceRepo: ShippingPriceRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shippingPriceRepo: ShippingPriceRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ShippingPrice>>;
    findOne(id: number, withRelated?: boolean): Promise<ShippingPrice>;
    create(data: ShippingPriceCreateRequest): Promise<ShippingPrice>;
    update(id: number, data: ShippingPriceUpdateRequest): Promise<ShippingPrice>;
    destroy(id: number): Promise<void>;
}
