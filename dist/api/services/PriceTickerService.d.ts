import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { PriceTickerRepository } from '../repositories/PriceTickerRepository';
import { PriceTicker } from '../models/PriceTicker';
import { PriceTickerCreateRequest } from '../requests/PriceTickerCreateRequest';
import { PriceTickerUpdateRequest } from '../requests/PriceTickerUpdateRequest';
import * as Request from 'request';
export declare class PriceTickerService {
    priceTickerRepo: PriceTickerRepository;
    Logger: typeof LoggerType;
    private requestApi;
    log: LoggerType;
    constructor(priceTickerRepo: PriceTickerRepository, Logger: typeof LoggerType, requestApi: typeof Request);
    findAll(): Promise<Bookshelf.Collection<PriceTicker>>;
    findOne(id: number, withRelated?: boolean): Promise<PriceTicker>;
    create(body: PriceTickerCreateRequest): Promise<PriceTicker>;
    update(id: number, body: PriceTickerUpdateRequest): Promise<PriceTicker>;
    /**
     * find data by symbol
     *
     * @param currency like BTC
     * @returns {Promise<PriceTicker>}
     */
    getOneBySymbol(currency: string): Promise<PriceTicker>;
    destroy(id: number): Promise<void>;
    /**
     * check if currency doesnt exist in db or the update timestamp is old, then fetch the updated tickers
     *
     * @returns {Promise<PriceTicker[]>}
     */
    getPriceTickers(currencies: string[]): Promise<PriceTicker[]>;
    /**
     * check if currency doesnt exist in db, so call the api update existing record and insert new record as well.
     *
     * @returns {Promise<void>}
     */
    private checkUpdateCreateRecord();
    /**
     * check updated in more than process.env.DATA_CHECK_DELAY ago
     *
     * @param currency
     * @returns {Promise<boolean>}
     */
    private needTobeUpdate(priceTicker);
    /**
     * call api for getting latest data to update
     *
     * @returns {<any>}
     */
    private getLatestData();
    /**
     * return diffrence between passing timestamp and current timestamp in SECONDS
     *
     * @param date : timestamp
     * @returns {<number>} timeDiff in seconds
     */
    private checkDiffBtwDate(timestamp);
}
