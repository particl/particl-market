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


export class PriceTickerService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.PriceTickerRepository) public priceTickerRepo: PriceTickerRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
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
    public async search(currency: string, cryptoId: string): Promise<PriceTicker> {
        return this.priceTickerRepo.search(currency, cryptoId);
    }

    public async destroy(id: number): Promise<void> {
        await this.priceTickerRepo.destroy(id);
    }

    /**
     * check and update PriceTicker
     *
     * @param currency
     * @returns {Promise<Bookshelf.Collection<PriceTicker>>}
     */
    public async checkAndUpdatePriceTicker(priceTicker: PriceTicker, updateData: any): Promise<any> {
        // check updated in more than 1 minute ago
        const diffMint = await this.checkDiffBtwDate(priceTicker['updatedAt']);
        if (diffMint > 1) {
            await this.update(priceTicker.id, {
                crypto_price_usd: updateData.price_usd,
                crypto_price_btc: updateData.price_btc,
                crypto_price_currency: updateData[`price_${priceTicker['convertCurrency'].toLowerCase()}`]
            } as PriceTickerUpdateRequest);
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
        const tricker: any = new Date(timestamp);
        return (current - tricker) / 60000;
    }
}
