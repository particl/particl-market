import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ListingItemObjectData } from '../models/ListingItemObjectData';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ListingItemObjectDataRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ListingItemObjectData) public ListingItemObjectDataModel: typeof ListingItemObjectData,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItemObjectData>> {
        const list = await this.ListingItemObjectDataModel.fetchAll();
        return list as Bookshelf.Collection<ListingItemObjectData>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItemObjectData> {
        return this.ListingItemObjectDataModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ListingItemObjectData> {
        const listingItemObjectData = this.ListingItemObjectDataModel.forge<ListingItemObjectData>(data);
        try {
            const listingItemObjectDataCreated = await listingItemObjectData.save();
            return this.ListingItemObjectDataModel.fetchById(listingItemObjectDataCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the listingItemObjectData!', error);
        }
    }

    public async update(id: number, data: any): Promise<ListingItemObjectData> {
        const listingItemObjectData = this.ListingItemObjectDataModel.forge<ListingItemObjectData>({ id });
        try {
            const listingItemObjectDataUpdated = await listingItemObjectData.save(data, { patch: true });
            return this.ListingItemObjectDataModel.fetchById(listingItemObjectDataUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the listingItemObjectData!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let listingItemObjectData = this.ListingItemObjectDataModel.forge<ListingItemObjectData>({ id });
        try {
            listingItemObjectData = await listingItemObjectData.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await listingItemObjectData.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the listingItemObjectData!', error);
        }
    }

}
