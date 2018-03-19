import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { PriceTickerRepository } from '../repositories/PriceTickerRepository';
import { PriceTicker } from '../models/PriceTicker';
import { PriceTickerCreateRequest } from '../requests/PriceTickerCreateRequest';
import { PriceTickerUpdateRequest } from '../requests/PriceTickerUpdateRequest';
import * as Request from 'request';

import { MessageException } from '../exceptions/MessageException';

export class PriceTickerService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.PriceTickerRepository) public priceTickerRepo: PriceTickerRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Lib) @named('request') private requestApi: typeof Request
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<PriceTicker>> {
        return this.priceTickerRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<PriceTicker> {
        const priceTicker = await this.priceTickerRepo.findOne(id, withRelated);
        if (priceTicker === null) {
            this.log.warn(`PriceTicker with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return priceTicker;
    }

    @validate()
    public async create( @request(PriceTickerCreateRequest) body: PriceTickerCreateRequest): Promise<PriceTicker> {
        // If the request body was valid we will create the priceTicker
        const priceTicker = await this.priceTickerRepo.create(body);

        // finally find and return the created priceTicker
        const newPriceTicker = await this.findOne(priceTicker.id);
        return newPriceTicker;
    }

    @validate()
    public async update(id: number, @request(PriceTickerUpdateRequest) body: PriceTickerUpdateRequest): Promise<PriceTicker> {
        // find the existing one without related
        const priceTicker = await this.findOne(id, false);

        // set new values
        priceTicker.CryptoId = body.crypto_id;
        priceTicker.CryptoName = body.crypto_name;
        // priceTicker.CryptoPriceCurrency = body.crypto_price_currency;

        priceTicker.CryptoRank = body.crypto_rank;
        priceTicker.CryptoSymbol = body.crypto_symbol;
        priceTicker.CryptoPriceUsd = body.crypto_price_usd;
        priceTicker.CryptoPriceBtc = body.crypto_price_btc;

        priceTicker.Crypto24HVolumeUsd = body.crypto_24h_volume_usd;
        priceTicker.CryptoMarketCapUsd = body.crypto_market_cap_usd;
        priceTicker.CryptoAvailableSupply = body.crypto_available_supply;

        priceTicker.CryptoTotalSupply = body.crypto_total_supply;
        priceTicker.CryptoMaxSupply = body.crypto_max_supply;
        priceTicker.CryptoPercentChange1H = body.crypto_percent_change_1h;

        priceTicker.CryptoPercentChange24H = body.crypto_percent_change_24h;
        priceTicker.CryptoPercentChange7D = body.crypto_percent_change_7d;
        priceTicker.CryptoLastUpdated = body.crypto_last_updated;

        priceTicker.CryptoPriceEur = body.crypto_price_eur;
        priceTicker.Crypto24HVolumeEur = body.crypto_24h_volume_eur;
        priceTicker.CryptoMarketCapEur = body.crypto_market_cap_eur;

        // update priceTicker record
        const updatedPriceTicker = await this.priceTickerRepo.update(id, priceTicker.toJSON());

        return updatedPriceTicker;
    }

    /**
     * find data by symbol
     *
     * @param currency like BTC
     * @returns {Promise<PriceTicker>}
     */
    @validate()
    public async getOneBySymbol(currency: string): Promise<PriceTicker> {
        return this.priceTickerRepo.getOneBySymbol(currency);
    }

    public async destroy(id: number): Promise<void> {
        await this.priceTickerRepo.destroy(id);
    }

    /**
     * check if currency doesnt exist in db or the update timestamp is old, then fetch the updated tickers
     *
     * @returns {Promise<PriceTicker[]>}
     */
    public async getPriceTickers(currencies: string[]): Promise<PriceTicker[]> {
        const returnData: any = [];
        for (let currency of currencies) { // ETH, BTC, XRP
            let priceTicker;
            currency = currency.toUpperCase(); // convert to UPPERCASE
            const symbolData = await this.getOneBySymbol(currency);
            if (symbolData) {
                // check and update
                const needToBeUpdate = await this.needTobeUpdate(symbolData);
                if (needToBeUpdate) {
                    // calling api
                    await this.checkUpdateCreateRecord();
                }
            } else {
                // call api and create
                await this.checkUpdateCreateRecord();
            }
            priceTicker = await this.getOneBySymbol(currency);
            returnData.push(priceTicker.toJSON());
        }
        return returnData;
    }

    /**
     * check if currency doesnt exist in db, so call the api update existing record and insert new record as well.
     *
     * @returns {Promise<void>}
     */
    private async checkUpdateCreateRecord(): Promise<void> {
        // call api
        const latestData = await this.getLatestData();
        for (const data of latestData) {
            const symbolData: any = await this.getOneBySymbol(data.symbol);
            const cryptoData = {
                crypto_id: data.id,
                crypto_name: data.name,
                crypto_symbol: data.symbol,
                crypto_rank: data.rank,
                crypto_price_usd: data.price_usd,
                crypto_price_btc: data.price_btc,
                crypto_24h_volume_usd: data['24h_volume_usd'],
                crypto_market_cap_usd: data.market_cap_usd,
                crypto_available_supply: data.available_supply,
                crypto_total_supply: data.total_supply,
                crypto_max_supply: data.max_supply,
                crypto_percent_change_1h: data.percent_change_1h,
                crypto_percent_change_24h: data.percent_change_24h,
                crypto_percent_change_7d: data.percent_change_7d,
                crypto_last_updated: data.last_updated,
                crypto_price_eur: data[`price_eur`],
                crypto_24h_volume_eur: data[`24h_volume_eur`],
                crypto_market_cap_eur: data[`market_cap_eur`]
            };
            if (symbolData) {
                // update record
                const updateSymbolRecord = await this.update(symbolData.id, cryptoData as PriceTickerUpdateRequest);
            } else {
                // insert
                const createdPriceTicker = await this.create(cryptoData as PriceTickerCreateRequest);
            }
        }
        return;
    }

    /**
     * check updated in more than process.env.DATA_CHECK_DELAY ago
     *
     * @param currency
     * @returns {Promise<boolean>}
     */
    private async needTobeUpdate(priceTicker: PriceTicker): Promise<boolean> {
        const diffMint = await this.checkDiffBtwDate(priceTicker.UpdatedAt);
        return (diffMint > process.env.DATA_CHECK_DELAY) ? true : false;
    }

    /**
     * call api for getting latest data to update
     *
     * @returns {<any>}
     */
    private async getLatestData(): Promise<any> {
        try {
            return new Promise<any>((resolve, reject) => {
                Request(`https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=200`, async (error, response, body) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(JSON.parse(body));
                });
            }).catch(() => {
                throw new MessageException(`Invalid currency`);
            });
        } catch (err) {
            throw new MessageException(`Error : ${err}`);
        }
    }

    /**
     * return diffrence between passing timestamp and current timestamp in SECONDS
     *
     * @param date : timestamp
     * @returns {<number>} timeDiff in seconds
     */
    private async checkDiffBtwDate(timestamp: Date): Promise<number> {
        const current: any = new Date();
        const ticker: any = new Date(timestamp);
        return (current - ticker) / 1000;
    }
}
