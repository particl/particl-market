import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ListingItemTemplateRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ListingItemTemplate) public ListingItemTemplateModel: typeof ListingItemTemplate,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        const list = await this.ListingItemTemplateModel.fetchAll();
        return list as Bookshelf.Collection<ListingItemTemplate>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItemTemplate> {
        return this.ListingItemTemplateModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ListingItemTemplate> {
        const listingItemTemplate = this.ListingItemTemplateModel.forge<ListingItemTemplate>(data);
        try {
            const listingItemTemplateCreated = await listingItemTemplate.save();
            return this.ListingItemTemplateModel.fetchById(listingItemTemplateCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the listingItemTemplate!', error);
        }
    }

    public async update(id: number, data: any): Promise<ListingItemTemplate> {
        const listingItemTemplate = this.ListingItemTemplateModel.forge<ListingItemTemplate>({ id });
        try {
            const listingItemTemplateUpdated = await listingItemTemplate.save(data, { patch: true });
            return this.ListingItemTemplateModel.fetchById(listingItemTemplateUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the listingItemTemplate!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let listingItemTemplate = this.ListingItemTemplateModel.forge<ListingItemTemplate>({ id });
        try {
            listingItemTemplate = await listingItemTemplate.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await listingItemTemplate.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the listingItemTemplate!', error);
        }
    }

}
