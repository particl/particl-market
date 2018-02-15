import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { CurrencyPrice } from '../models/CurrencyPrice';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { CurrencyPriceParams } from '../requests/CurrencyPriceParams';

export class CurrencyPriceRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.CurrencyPrice) public CurrencyPriceModel: typeof CurrencyPrice,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<CurrencyPrice>> {
        const list = await this.CurrencyPriceModel.fetchAll();
        return list as Bookshelf.Collection<CurrencyPrice>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<CurrencyPrice> {
        return this.CurrencyPriceModel.fetchById(id, withRelated);
    }

    /**
     *
     * @param options, CurrencyPriceParams
     * @returns {Promise<CurrencyPrice>}
     */
    public async search(options: CurrencyPriceParams): Promise<CurrencyPrice> {
        return this.CurrencyPriceModel.search(options);
    }

    public async create(data: any): Promise<CurrencyPrice> {
        const currencyPrice = this.CurrencyPriceModel.forge<CurrencyPrice>(data);
        try {
            const currencyPriceCreated = await currencyPrice.save();
            return this.CurrencyPriceModel.fetchById(currencyPriceCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the currencyPrice!', error);
        }
    }

    public async update(id: number, data: any): Promise<CurrencyPrice> {
        const currencyPrice = this.CurrencyPriceModel.forge<CurrencyPrice>({ id });
        try {
            const currencyPriceUpdated = await currencyPrice.save(data, { patch: true });
            return this.CurrencyPriceModel.fetchById(currencyPriceUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the currencyPrice!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let currencyPrice = this.CurrencyPriceModel.forge<CurrencyPrice>({ id });
        try {
            currencyPrice = await currencyPrice.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await currencyPrice.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the currencyPrice!', error);
        }
    }

}
