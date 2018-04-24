import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { CurrencyPriceRepository } from '../repositories/CurrencyPriceRepository';
import { CurrencyPrice } from '../models/CurrencyPrice';
import { CurrencyPriceCreateRequest } from '../requests/CurrencyPriceCreateRequest';
import { CurrencyPriceUpdateRequest } from '../requests/CurrencyPriceUpdateRequest';
import { CurrencyPriceParams } from '../requests/CurrencyPriceParams';
import * as Request from 'request';
import * as resources from 'resources';
export declare class CurrencyPriceService {
    currencyPriceRepo: CurrencyPriceRepository;
    private apiRequest;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(currencyPriceRepo: CurrencyPriceRepository, apiRequest: typeof Request, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<CurrencyPrice>>;
    findOne(id: number, withRelated?: boolean): Promise<CurrencyPrice>;
    /**
     * search CurrencyPrice using given CurrencyPriceParams
     *
     * @param options
     * @returns {Promise<CurrencyPrice>}
     */
    search(options: CurrencyPriceParams): Promise<CurrencyPrice>;
    /**
     *
     * fromCurrency: fromCurrency name (PART for now)
     * toCurrencies[]: array of toCurrencies
     * example: toCurrencies[] = [INR, USD, EUR, GBP]
     *
     * description: from argument must be PART for now and toCurrencies is an array of toCurrencies like [INR, USD, EUR, GBP].
     *
     * @returns {Promise<CurrencyPrice[]>}
     */
    getCurrencyPrices(fromCurrency: string, toCurrencies: string[]): Promise<resources.CurrencyPrice[]>;
    create(body: CurrencyPriceCreateRequest): Promise<CurrencyPrice>;
    update(id: number, body: CurrencyPriceUpdateRequest): Promise<CurrencyPrice>;
    destroy(id: number): Promise<void>;
    /**
     * get the updated currency price
     * fromCurrency: PART (must be PART for now)
     * toCurrency: another currencies for which we want to convert
     * @returns {Promise<any>}
     */
    private getUpdatedCurrencyPrice(fromCurrency, toCurrency);
    /**
     * currencyUpdatedAt: timestamp
     * @returns {Promise<boolean>}
     */
    private needToUpdate(currencyUpdatedAt);
}
