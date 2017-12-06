import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { BidData } from '../models/BidData';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class BidDataRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.BidData) public BidDataModel: typeof BidData,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<BidData>> {
        const list = await this.BidDataModel.fetchAll();
        return list as Bookshelf.Collection<BidData>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<BidData> {
        return this.BidDataModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<BidData> {
        const bidData = this.BidDataModel.forge<BidData>(data);
        try {
            const bidDataCreated = await bidData.save();
            return this.BidDataModel.fetchById(bidDataCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the bidData!', error);
        }
    }

    public async update(id: number, data: any): Promise<BidData> {
        const bidData = this.BidDataModel.forge<BidData>({ id });
        try {
            const bidDataUpdated = await bidData.save(data, { patch: true });
            return this.BidDataModel.fetchById(bidDataUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the bidData!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let bidData = this.BidDataModel.forge<BidData>({ id });
        try {
            bidData = await bidData.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await bidData.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the bidData!', error);
        }
    }

}
