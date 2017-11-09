import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ListingItem } from '../models/ListingItem';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ListingItemRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ListingItem) public ListingItemModel: typeof ListingItem,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItem>> {
        const list = await this.ListingItemModel.fetchAll();
        return list as Bookshelf.Collection<ListingItem>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItem> {
        return this.ListingItemModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ListingItem> {
        const listingItem = this.ListingItemModel.forge<ListingItem>(data);
        try {
            const listingItemCreated = await listingItem.save();
            return this.ListingItemModel.fetchById(listingItemCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the listingItem!', error);
        }
    }

    public async update(id: number, data: any): Promise<ListingItem> {
        const listingItem = this.ListingItemModel.forge<ListingItem>({ id });
        try {
            const listingItemUpdated = await listingItem.save(data, { patch: true });
            return this.ListingItemModel.fetchById(listingItemUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the listingItem!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let listingItem = this.ListingItemModel.forge<ListingItem>({ id });
        try {
            listingItem = await listingItem.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await listingItem.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the listingItem!', error);
        }
    }

    public async findAllItems(data: any): Promise<Bookshelf.Collection<ListingItem>> {
        const list = await this.ListingItemModel.forge<ListingItem>().query((qb: any) => {
                qb.innerJoin('item_informations', 'item_informations.listing_item_id', 'listing_items.id')
                .innerJoin('item_categories', 'item_informations.item_category_id', 'item_categories.id');
                qb.groupBy('listing_items.id');

            }).orderBy('item_categories.name', data.order).query({
              limit: data.pageLimit,
              offset: (data.page - 1) * data.pageLimit

            }).fetchAll({withRelated: ['ItemInformation', 'ItemInformation.ItemCategory']});

        return list as Bookshelf.Collection<ListingItem>;
    }


    public async findOneByHsh(hash: string): Promise<ListingItem> {
        return this.ListingItemModel.fetchByHash(hash);
    }

}
