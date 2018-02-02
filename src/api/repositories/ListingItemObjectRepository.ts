import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ListingItemObject } from '../models/ListingItemObject';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemObjectSearchParams } from '../requests/ListingItemObjectSearchParams';

export class ListingItemObjectRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ListingItemObject) public ListingItemObjectModel: typeof ListingItemObject,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItemObject>> {
        const list = await this.ListingItemObjectModel.fetchAll();
        return list as Bookshelf.Collection<ListingItemObject>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItemObject> {
        return this.ListingItemObjectModel.fetchById(id, withRelated);
    }

    /**
     *
     * @param options, ListingItemObjectSearchParams
     * @returns {Promise<Bookshelf.Collection<ListingItemObject>>}
     */
    public async search(options: ListingItemObjectSearchParams): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.ListingItemObjectModel.searchBy(options);
    }

    public async create(data: any): Promise<ListingItemObject> {
        const listingItemObject = this.ListingItemObjectModel.forge<ListingItemObject>(data);
        try {
            const listingItemObjectCreated = await listingItemObject.save();
            return this.ListingItemObjectModel.fetchById(listingItemObjectCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the listingItemObject!', error);
        }
    }

    public async update(id: number, data: any): Promise<ListingItemObject> {
        const listingItemObject = this.ListingItemObjectModel.forge<ListingItemObject>({ id });
        try {
            const listingItemObjectUpdated = await listingItemObject.save(data, { patch: true });
            return this.ListingItemObjectModel.fetchById(listingItemObjectUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the listingItemObject!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let listingItemObject = this.ListingItemObjectModel.forge<ListingItemObject>({ id });
        try {
            listingItemObject = await listingItemObject.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await listingItemObject.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the listingItemObject!', error);
        }
    }

}
