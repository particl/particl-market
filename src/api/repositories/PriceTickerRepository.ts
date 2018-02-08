import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { PriceTicker } from '../models/PriceTicker';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class PriceTickerRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.PriceTicker) public PriceTickerModel: typeof PriceTicker,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<PriceTicker>> {
        const list = await this.PriceTickerModel.fetchAll();
        return list as Bookshelf.Collection<PriceTicker>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<PriceTicker> {
        return this.PriceTickerModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<PriceTicker> {
        const priceTicker = this.PriceTickerModel.forge<PriceTicker>(data);
        try {
            const priceTickerCreated = await priceTicker.save();
            return this.PriceTickerModel.fetchById(priceTickerCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the priceTicker!', error);
        }
    }

    public async update(id: number, data: any): Promise<PriceTicker> {
        const priceTicker = this.PriceTickerModel.forge<PriceTicker>({ id });
        try {
            const priceTickerUpdated = await priceTicker.save(data, { patch: true });
            return this.PriceTickerModel.fetchById(priceTickerUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the priceTicker!', error);
        }
    }

    public async search(currency: string): Promise<Bookshelf.Collection<PriceTicker>> {
        return this.PriceTickerModel.search(currency);
    }

    public async destroy(id: number): Promise<void> {
        let priceTicker = this.PriceTickerModel.forge<PriceTicker>({ id });
        try {
            priceTicker = await priceTicker.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await priceTicker.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the priceTicker!', error);
        }
    }

}
