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

        // TODO: extract and remove related models from request
        // const priceTickerRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the priceTicker
        const priceTicker = await this.priceTickerRepo.create(body);

        // TODO: create related models
        // priceTickerRelated._id = priceTicker.Id;
        // await this.priceTickerRelatedService.create(priceTickerRelated);

        // finally find and return the created priceTicker
        const newPriceTicker = await this.findOne(priceTicker.id);
        return newPriceTicker;
    }

    @validate()
    public async update(id: number, @request(PriceTickerUpdateRequest) body: PriceTickerUpdateRequest): Promise<PriceTicker> {
        // find the existing one without related
        const priceTicker = await this.findOne(id, false);

        // set new values
        priceTicker.CryptoPriceUsd = body.crypto_price_usd;
        priceTicker.CryptoPriceBtc = body.crypto_price_btc;
        priceTicker.CryptoPriceCurrency = body.crypto_price_currency;
        // update priceTicker record
        const updatedPriceTicker = await this.priceTickerRepo.update(id, priceTicker.toJSON());

        // TODO: find related record and update it

        // TODO: finally find and return the updated priceTicker
        // const newPriceTicker = await this.findOne(id);
        // return newPriceTicker;

        return updatedPriceTicker;
    }

    /**
     * search Collection<PriceTicker> using given currency
     *
     * @param currency
     * @returns {Promise<Bookshelf.Collection<PriceTicker>>}
     */
    @validate()
    public async search(currency: string): Promise<Bookshelf.Collection<PriceTicker>> {
        return this.priceTickerRepo.search(currency);
    }

    public async destroy(id: number): Promise<void> {
        await this.priceTickerRepo.destroy(id);
    }

    /**
     * update PriceTicker
     *
     * @param priceTicker
     * @param apidata
     * @returns {Promise<any>}
     */
    public async updatePriceTicker(priceTickerColl: any, currency: string): Promise<any> {
        // call api
        const returnData: any = [];
        const updateDataCollection = await this.getLatestData(currency);
        for (const priceTicker of priceTickerColl) {
            // find and update
            const updateData = updateDataCollection.filter((el) => {
                return el.symbol === priceTicker['cryptoSymbol'];
            })[0];
            const updatePriceTicker = await this.update(priceTicker.id, {
                crypto_rank: updateData.rank,
                crypto_price_usd: updateData.price_usd,
                crypto_price_btc: updateData.price_btc,
                crypto_24h_volume_usd: updateData['24h_volume_usd'],
                crypto_market_cap_usd: updateData.market_cap_usd,
                crypto_available_supply: updateData.available_supply,
                crypto_total_supply: updateData.total_supply,
                crypto_max_supply: updateData.max_supply,
                crypto_percent_change_1h: updateData.percent_change_1h,
                crypto_percent_change_24h: updateData.percent_change_24h,
                crypto_percent_change_7d: updateData.percent_change_7d,
                crypto_last_updated: updateData.last_updated,
                crypto_price_currency: updateData[`price_${currency.toLowerCase()}`],
                crypto_24h_volume_currency: updateData[`24h_volume_${currency.toLowerCase()}`],
                crypto_market_cap_currency: updateData[`market_cap_${currency.toLowerCase()}`]
            } as PriceTickerUpdateRequest);
            returnData.push(updatePriceTicker);
        }
        return returnData;
    }

    /**
     * check updated in more than 1 minute ago
     *
     * @param currency
     * @returns {Promise<PriceTicker>}
     */
    public async needTobeUpdate(priceTicker: PriceTicker): Promise<boolean> {
        const diffMint = await this.checkDiffBtwDate(priceTicker['updatedAt']);
        return (diffMint > process.env.DATA_CHECK_DELAY) ? true : false;
    }

    public async getAndCreateData(currency: string): Promise<any> {
        const returnData: any = [];
        const dataCollection = await this.getLatestData(currency);
        for (const res of dataCollection) {
            const createdPriceTicker = await this.create({
                crypto_id: res.id,
                crypto_name: res.name,
                crypto_symbol: res.symbol,
                crypto_rank: res.rank,
                crypto_price_usd: res.price_usd,
                crypto_price_btc: res.price_btc,
                crypto_24h_volume_usd: res['24h_volume_usd'],
                crypto_market_cap_usd: res.market_cap_usd,
                crypto_available_supply: res.available_supply,
                crypto_total_supply: res.total_supply,
                crypto_max_supply: res.max_supply,
                crypto_percent_change_1h: res.percent_change_1h,
                crypto_percent_change_24h: res.percent_change_24h,
                crypto_percent_change_7d: res.percent_change_7d,
                crypto_last_updated: res.last_updated,
                crypto_price_currency: res[`price_${currency.toLowerCase()}`],
                crypto_24h_volume_currency: res[`24h_volume_${currency.toLowerCase()}`],
                crypto_market_cap_currency: res[`market_cap_${currency.toLowerCase()}`],
                currency
            } as PriceTickerCreateRequest);
            returnData.push(createdPriceTicker);
        }
        return returnData;
    }

    /**
     * call api for getting latest data to update
     *
     * @param currency : currency
     * @returns {<any>}
     */
    private async getLatestData(currency: string): Promise<any> {
        try {
            return new Promise<any>((resolve, reject) => {
                Request(`https://api.coinmarketcap.com/v1/ticker/?convert=${currency}&limit=200`, async (error, response, body) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(JSON.parse(body));
                });
            }).catch(() => {
                throw new MessageException(`Invalid currency ${currency}`);
            });
        } catch (err) {
            throw new MessageException(`Invalid currency ${currency}`);
        }
    }

    /**
     * return diffrence between passing timestamp and current timestamp in MINUTES
     *
     * @param date : timestamp
     * @returns {<number>} timeDiff in minutes
     */
    private async checkDiffBtwDate(timestamp: Date): Promise<number> {
        const current: any = new Date();
        const ticker: any = new Date(timestamp);
        return (current - ticker) / 60000;
    }
}
