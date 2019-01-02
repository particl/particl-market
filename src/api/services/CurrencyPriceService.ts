// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { CurrencyPriceRepository } from '../repositories/CurrencyPriceRepository';
import { CurrencyPrice } from '../models/CurrencyPrice';
import { CurrencyPriceCreateRequest } from '../requests/CurrencyPriceCreateRequest';
import { CurrencyPriceUpdateRequest } from '../requests/CurrencyPriceUpdateRequest';
import { CurrencyPriceParams } from '../requests/CurrencyPriceParams';
import * as Request from 'request';
import { MessageException } from '../exceptions/MessageException';
import { SupportedCurrencies } from '../enums/SupportedCurrencies';
import * as resources from 'resources';

export class CurrencyPriceService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.CurrencyPriceRepository) public currencyPriceRepo: CurrencyPriceRepository,
        @inject(Types.Lib) @named('request') private apiRequest: typeof Request,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<CurrencyPrice>> {
        return this.currencyPriceRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<CurrencyPrice> {
        const currencyPrice = await this.currencyPriceRepo.findOne(id, withRelated);
        if (currencyPrice === null) {
            this.log.warn(`CurrencyPrice with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return currencyPrice;
    }

    /**
     * search CurrencyPrice using given CurrencyPriceParams
     *
     * @param options
     * @returns {Promise<CurrencyPrice>}
     */
    @validate()
    public async search(@request(CurrencyPriceParams) options: CurrencyPriceParams): Promise<CurrencyPrice> {
        return await this.currencyPriceRepo.search(options);
    }

    /**
     *
     * example: toCurrencies[] = [INR, USD, EUR, GBP]
     *
     * description: from argument must be PART for now and toCurrencies is an array of toCurrencies like [INR, USD, EUR, GBP].
     *
     * @param {string} fromCurrency name (PART for now)
     * @param {string[]} toCurrencies array of toCurrencies
     * @returns {Promise<"resources".CurrencyPrice[]>}
     */
    public async getCurrencyPrices(fromCurrency: string, toCurrencies: string[]): Promise<resources.CurrencyPrice[]> {

        const returnData: any = [];
        for (let toCurrency of toCurrencies) {
            toCurrency = toCurrency.toUpperCase();
            // check for valid currency
            if (SupportedCurrencies[toCurrency]) {
                const currencyPriceModel: CurrencyPrice = await this.search({
                    from: fromCurrency,
                    to: toCurrency
                } as CurrencyPriceParams);

                const currency = currencyPriceModel && currencyPriceModel.toJSON();
                this.log.debug('currency:', currency);

                // check if currency already exist in the db then update the price
                if (currency) {
                    const needToUpdate = await this.needToUpdate(currency.updatedAt);
                    if (needToUpdate) {
                        // get the update currency price
                        const updatedCurrency = await this.getUpdatedCurrencyPrice(fromCurrency, toCurrency);
                        // update the existing currency price
                        const updatedCurrencyPrice = await this.update(currency.id, {
                            from: fromCurrency,
                            to: toCurrency,
                            price: updatedCurrency.result
                        } as CurrencyPriceUpdateRequest);

                        returnData.push(updatedCurrencyPrice.toJSON());
                    } else {
                        returnData.push(currency);
                    }
                } else {
                    // get the update currency price
                    const updatedCurrency = await this.getUpdatedCurrencyPrice(fromCurrency, toCurrency);
                    // create the new currency price
                    const createdCurrencyPrice = await this.create({
                        from: fromCurrency,
                        to: toCurrency,
                        price: updatedCurrency.result
                    } as CurrencyPriceCreateRequest);

                    returnData.push(createdCurrencyPrice.toJSON());
                }
            } else {
                throw new MessageException(`Invalid or unsupported currency: ${toCurrency}.`);
            }
        }
        // this.log.debug('currencyData: ', returnData);
        return returnData;
    }

    @validate()
    public async create( @request(CurrencyPriceCreateRequest) body: CurrencyPriceCreateRequest): Promise<CurrencyPrice> {

        // If the request body was valid we will create the currencyPrice
        const currencyPrice = await this.currencyPriceRepo.create(body);

        // finally find and return the created currencyPrice
        const newCurrencyPrice = await this.findOne(currencyPrice.id);
        return newCurrencyPrice;
    }

    @validate()
    public async update(id: number, @request(CurrencyPriceUpdateRequest) body: CurrencyPriceUpdateRequest): Promise<CurrencyPrice> {

        // find the existing one without related
        const currencyPrice = await this.findOne(id, false);

        // set new values
        currencyPrice.From = body.from;
        currencyPrice.To = body.to;
        currencyPrice.Price = body.price;

        // update currencyPrice record
        const updatedCurrencyPrice = await this.currencyPriceRepo.update(id, currencyPrice.toJSON());

        // return newCurrencyPrice;
        return updatedCurrencyPrice;
    }

    public async destroy(id: number): Promise<void> {
        await this.currencyPriceRepo.destroy(id);
    }

    /**
     * get the updated currency price
     * fromCurrency: PART (must be PART for now)
     * toCurrency: another currencies for which we want to convert
     * @returns {Promise<any>}
     */

    private async getUpdatedCurrencyPrice(fromCurrency: string, toCurrency: string): Promise<any> {
        try {
            return new Promise<any>((resolve, reject) => {
                this.apiRequest.get(
                    process.env.CHASING_COINS_API + '/' + fromCurrency + '/' + toCurrency,
                    {
                        strictSSL: false
                    }, async (error: any, response: Request.RequestResponse, body: any) => {
                    if (error || body.includes('Undefined property')) {
                        this.log.error('error while fetching currencyprice:', error);
                        reject(error);
                    } else {
                        resolve(JSON.parse(body));
                    }
                });
            }).catch(() => {
                throw new MessageException(`Invalid or unsupported currency, <${toCurrency}> or <${fromCurrency}>.`);
            });
        } catch (err) {
            throw new MessageException(`Cannot add currency price ${err}.`);
        }
    }

    /**
     * currencyUpdatedAt: timestamp
     * @returns {Promise<boolean>}
     */

    private async needToUpdate(currencyUpdatedAt: number): Promise<boolean> {
        const current: any = new Date().getTime();
        const ticker: any = new Date(currencyUpdatedAt).getTime();
        // check if the results in db are older than 60 second
        const secondsSinceUpdate = ((current - ticker) / 1000);
        this.log.debug('secondsSinceUpdate:', secondsSinceUpdate);
        return ( secondsSinceUpdate > Number(process.env.CHASING_COINS_API_DELAY));
    }
}
