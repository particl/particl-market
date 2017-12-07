import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Market } from '../models/Market';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class MarketRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Market) public MarketModel: typeof Market,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Market>> {
        const list = await this.MarketModel.fetchAll();
        return list as Bookshelf.Collection<Market>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Market> {
        return this.MarketModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<Market> {
        const market = this.MarketModel.forge<Market>(data);
        try {
            const marketCreated = await market.save();
            return this.MarketModel.fetchById(marketCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the market!', error);
        }
    }

    public async update(id: number, data: any): Promise<Market> {
        const market = this.MarketModel.forge<Market>({ id });
        try {
            const marketUpdated = await market.save(data, { patch: true });
            return this.MarketModel.fetchById(marketUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the market!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let market = this.MarketModel.forge<Market>({ id });
        try {
            market = await market.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await market.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the market!', error);
        }
    }

}
