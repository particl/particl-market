import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ItemPriceRepository } from '../repositories/ItemPriceRepository';
import { ItemPrice } from '../models/ItemPrice';
import { ItemPriceCreateRequest } from '../requests/ItemPriceCreateRequest';
import { ItemPriceUpdateRequest } from '../requests/ItemPriceUpdateRequest';
import { ShippingPriceService } from './ShippingPriceService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
export declare class ItemPriceService {
    private cryptocurrencyAddressService;
    private shippingpriceService;
    itemPriceRepo: ItemPriceRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(cryptocurrencyAddressService: CryptocurrencyAddressService, shippingpriceService: ShippingPriceService, itemPriceRepo: ItemPriceRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemPrice>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemPrice>;
    create(data: ItemPriceCreateRequest): Promise<ItemPrice>;
    update(id: number, data: ItemPriceUpdateRequest): Promise<ItemPrice>;
    destroy(id: number): Promise<void>;
}
