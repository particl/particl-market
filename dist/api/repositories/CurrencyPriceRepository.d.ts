import * as Bookshelf from 'bookshelf';
import { CurrencyPrice } from '../models/CurrencyPrice';
import { Logger as LoggerType } from '../../core/Logger';
import { CurrencyPriceParams } from '../requests/CurrencyPriceParams';
export declare class CurrencyPriceRepository {
    CurrencyPriceModel: typeof CurrencyPrice;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(CurrencyPriceModel: typeof CurrencyPrice, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<CurrencyPrice>>;
    findOne(id: number, withRelated?: boolean): Promise<CurrencyPrice>;
    /**
     *
     * @param options, CurrencyPriceParams
     * @returns {Promise<CurrencyPrice>}
     */
    search(options: CurrencyPriceParams): Promise<CurrencyPrice>;
    create(data: any): Promise<CurrencyPrice>;
    update(id: number, data: any): Promise<CurrencyPrice>;
    destroy(id: number): Promise<void>;
}
