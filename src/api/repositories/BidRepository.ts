import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Bid } from '../models/Bid';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { BidSearchParams } from '../requests/BidSearchParams';

export class BidRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Bid) public BidModel: typeof Bid,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Bid>> {
        const list = await this.BidModel.fetchAll();
        return list as Bookshelf.Collection<Bid>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Bid> {
        return this.BidModel.fetchById(id, withRelated);
    }

    /**
     * todo: optionally fetch withRelated
     *
     * @param options, BidSearchParams
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    public async search(options: BidSearchParams, withRelated: boolean): Promise<Bookshelf.Collection<Bid>> {
        return this.BidModel.search(options, withRelated);
    }

    public async create(data: any): Promise<Bid> {
        const bid = this.BidModel.forge<Bid>(data);
        try {
            const bidCreated = await bid.save();
            return this.BidModel.fetchById(bidCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the bid!', error);
        }
    }

    public async update(id: number, data: any): Promise<Bid> {
        const bid = this.BidModel.forge<Bid>({ id });
        try {
            const bidUpdated = await bid.save(data, { patch: true });
            return this.BidModel.fetchById(bidUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the bid!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let bid = this.BidModel.forge<Bid>({ id });
        try {
            bid = await bid.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await bid.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the bid!', error);
        }
    }

}
