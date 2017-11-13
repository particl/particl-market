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

    public async findByCategory(categoryId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<ListingItem>> {
        return this.ListingItemModel.fetchByCategory(categoryId, withRelated);
        /*
        const listingCollection = this.ListingItemModel.forge<Bookshelf.Collection<ListingItem>>()
            .query( qb => {
                qb.innerJoin('item_informations', 'listing_items.id', 'item_informations.listing_item_id');
                // qb.groupBy('listing_items.id');
                qb.where('item_informations.item_category_id', '=', categoryId);
                qb.andWhere('item_informations.item_category_id', '>', 0);
            })
            .orderBy('item_informations.title', 'DESC');
            // .where('item_informations.item_category_id', '=', categoryId);

        const rows = await listingCollection.fetchAll({
            withRelated: ['ItemInformation']
        });

        rows.forEach(item => {
             this.log.debug('item:', item.toJSON() );
        });

        return rows as Bookshelf.Collection<ListingItem>;
        */
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

    /**
     * options: Object.
     * params: page, pageLimit, order.
     * Example: {page: 1, pageLimit: 1, order: 'DESC'}
     */

    public async findAllItems(options: any): Promise<Bookshelf.Collection<ListingItem>> {
        const list = await this.ListingItemModel.forge<ListingItem>().query((qb: any) => {
                qb.innerJoin('item_informations', 'item_informations.listing_item_id', 'listing_items.id');
                qb.groupBy('listing_items.id');

            }).orderBy('item_informations.title', options.order).query({
              limit: options.pageLimit,
              offset: (options.page - 1) * options.pageLimit

            }).fetchAll({withRelated: ['ItemInformation', 'ItemInformation.ItemCategory']});

        return list as Bookshelf.Collection<ListingItem>;
    }


    public async findOneByHash(hash: string): Promise<ListingItem> {
        return this.ListingItemModel.fetchByHash(hash);
    }

    /**
     * options: Array.
     * params: categoryId, searchTerm, withRelated
     * Example: [1, "category name", true]
     */

    public async searchByCategoryIdOrName(options: any): Promise<Bookshelf.Collection<ListingItem>> {
        return this.ListingItemModel.searchByCategoryOrName(options[0], options[1], options[2]);
    }

}
