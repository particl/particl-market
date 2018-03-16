import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { ListingItem } from './ListingItem';
import { ListingItemTemplate } from './ListingItemTemplate';
import { ListingItemObjectSearchParams } from '../requests/ListingItemObjectSearchParams';
import { ListingItemObjectData } from './ListingItemObjectData';

export class ListingItemObject extends Bookshelf.Model<ListingItemObject> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ListingItemObject> {
        if (withRelated) {
            return await ListingItemObject.where<ListingItemObject>({ id: value }).fetch({
                withRelated: [
                    'ListingItem',
                    'ListingItemTemplate',
                    'ListingItemObjectData'
                ]
            });
        } else {
            return await ListingItemObject.where<ListingItemObject>({ id: value }).fetch();
        }
    }

    public static async searchBy(options: ListingItemObjectSearchParams): Promise<Collection<ListingItemObject>> {
        const listingCollection = ListingItemObject.forge<Collection<ListingItemObject>>()
            .query(qb => {
                qb.where('listing_item_objects.type', 'LIKE', '%' + options.searchString + '%');
                qb.orWhere('listing_item_objects.description', 'LIKE', '%' + options.searchString + '%');
            })
            .orderBy('listing_item_objects.id', 'ASC');

        return await listingCollection.fetchAll();
    }

    public get tableName(): string { return 'listing_item_objects'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get Order(): number { return this.get('order'); }
    public set Order(value: number) { this.set('order', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }


    public ListingItem(): ListingItem {
        return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }

    public ListingItemTemplate(): ListingItemTemplate {
        return this.belongsTo(ListingItemTemplate, 'listing_item_template_id', 'id');
    }

    public ListingItemObjectData(): Collection<ListingItemObjectData> {
        return this.hasMany(ListingItemObjectData, 'listing_item_object_id', 'id');
    }

}
