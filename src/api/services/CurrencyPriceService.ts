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
    public async search(
        @request(CurrencyPriceParams) options: CurrencyPriceParams
        ): Promise<CurrencyPrice> {
        return this.currencyPriceRepo.search(options);
    }

    /**
     *
     * fromCurrency: fromCurrency name (PART for now)
     * toCurrencies[]: array of toCurrencies
     * example: toCurrencies[] = [INR, USD, EUR, GBP]
     *
     * description: from argument must be PART for now and toCurrencies is an array of toCurrencies like [INR, USD, EUR, GBP].
     *
     * @returns {Promise<Bookshelf.Collection<CurrencyPrice>>}
     */

    public async getCurrencyPrices(fromCurrency: string, toCurrencies: string[]): Promise<Bookshelf.Collection<CurrencyPrice>> {

        const returnData: any = [];
        for (const toCurrency of toCurrencies) {
            // check for valid currency
            if (SupportedCurrencies[toCurrency]) {
                const currencyPriceModel: CurrencyPrice = await this.search({
                    from: fromCurrency,
                    to: toCurrency
                } as CurrencyPriceParams);

                const currency = currencyPriceModel && currencyPriceModel.toJSON();

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
                throw new MessageException(`Invalid currency ${toCurrency}`);
            }
        }
        this.log.debug('currencyData: ', returnData);
        // return all currency prices
        return returnData;
    }

    @validate()
    public async create( @request(CurrencyPriceCreateRequest) body: any): Promise<CurrencyPrice> {

        // If the request body was valid we will create the currencyPrice
        const currencyPrice = await this.currencyPriceRepo.create(body);

        // finally find and return the created currencyPrice
        const newCurrencyPrice = await this.findOne(currencyPrice.id);
        return newCurrencyPrice;
    }

    @validate()
    public async update(id: number, @request(CurrencyPriceUpdateRequest) body: any): Promise<CurrencyPrice> {

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
                this.apiRequest({
                    method: 'GET',
                    url: `${process.env.CHASING_COINS_API}/${fromCurrency}/${toCurrency}`
                }, async (error: any, response: Request.RequestResponse, body: any) => {
                    if (error || body.includes('Undefined property')) {
                        reject(error);
                    }
                    resolve(JSON.parse(body));
                });
            }).catch(() => {
                throw new MessageException(`Invalid currency ${toCurrency} or ${fromCurrency}`);
            });
        } catch (err) {
            throw new MessageException(`Cannot add currency price ${err}`);
        }
    }

    /**
     * currencyUpdatedAt: timestamp
     * @returns {Promise<boolean>}
     */

    private async needToUpdate(currencyUpdatedAt: number): Promise<boolean> {
        const current: any = new Date();
        const tricker: any = new Date(currencyUpdatedAt);
        // check if the results in db are older than 60 second
        return (((current - tricker) / 1000) > process.env.CHASING_COINS_API_DELAY);
    }
}
