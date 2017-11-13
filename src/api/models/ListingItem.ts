import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ItemInformation } from './ItemInformation';
import { PaymentInformation } from './PaymentInformation';
import { MessagingInformation } from './MessagingInformation';
import { ListingItemObject } from './ListingItemObject';


export class ListingItem extends Bookshelf.Model<ListingItem> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ListingItem> {
        if (withRelated) {
            return await ListingItem.where<ListingItem>({ id: value }).fetch({
                withRelated: [
                    'ItemInformation',
                    'ItemInformation.ItemCategory',
                    'ItemInformation.ItemLocation',
                    'ItemInformation.ItemLocation.LocationMarker',
                    'ItemInformation.ItemImages',
                    'ItemInformation.ItemImages.ItemImageData',
                    'ItemInformation.ShippingDestinations',
                    'PaymentInformation',
                    'PaymentInformation.Escrow',
                    'PaymentInformation.Escrow.Ratio',
                    'PaymentInformation.ItemPrice',
                    'PaymentInformation.ItemPrice.ShippingPrice',
                    'PaymentInformation.ItemPrice.Address',
                    'MessagingInformation',
                    'ListingItemObjects'
                ]
            });
        } else {
            return await ListingItem.where<ListingItem>({ id: value }).fetch();
        }
    }

    public static async fetchByHash(value: string): Promise<ListingItem> {
        return await ListingItem.where<ListingItem>({ hash: value }).fetch({
            withRelated: [
                'ItemInformation',
                'ItemInformation.ItemCategory',
                'ItemInformation.ItemLocation',
                'ItemInformation.ItemLocation.LocationMarker',
                'ItemInformation.ItemImages',
                'ItemInformation.ItemImages.ItemImageData',
                'ItemInformation.ShippingDestinations',
                'PaymentInformation',
                'PaymentInformation.Escrow',
                'PaymentInformation.Escrow.Ratio',
                'PaymentInformation.ItemPrice',
                'PaymentInformation.ItemPrice.ShippingPrice',
                'PaymentInformation.ItemPrice.Address',
                'MessagingInformation',
                'ListingItemObjects'
            ]
        });
    }

    public static async fetchByCategory(categoryId: number, withRelated: boolean = true): Promise<Collection<ListingItem>> {

        const listingCollection = ListingItem.forge<Collection<ListingItem>>()
            .query( qb => {
                qb.innerJoin('item_informations', 'listing_items.id', 'item_informations.listing_item_id');
                // qb.groupBy('listing_items.id');
                qb.where('item_informations.item_category_id', '=', categoryId);
                qb.andWhere('item_informations.item_category_id', '>', 0);
            })
            .orderBy('item_informations.title', 'ASC');
        // .where('item_informations.item_category_id', '=', categoryId);

        if (withRelated) {
            return await listingCollection.fetchAll({
                withRelated: [
                    'ItemInformation',
                    'ItemInformation.ItemCategory',
                    'ItemInformation.ItemLocation',
                    'ItemInformation.ItemLocation.LocationMarker',
                    'ItemInformation.ItemImages',
                    'ItemInformation.ItemImages.ItemImageData',
                    'ItemInformation.ShippingDestinations',
                    'PaymentInformation',
                    'PaymentInformation.Escrow',
                    'PaymentInformation.Escrow.Ratio',
                    'PaymentInformation.ItemPrice',
                    'PaymentInformation.ItemPrice.ShippingPrice',
                    'PaymentInformation.ItemPrice.Address',
                    'MessagingInformation',
                    'ListingItemObjects'
                ]
            });
        } else {
            return await listingCollection.fetchAll();
        }
    }

    public static async searchByCategoryOrName(categoryId: number, searchTerm: string = '', withRelated: boolean = true): Promise<Collection<ListingItem>> {

        const listingCollection = ListingItem.forge<Collection<ListingItem>>()
            .query( qb => {
                qb.innerJoin('item_informations', 'listing_items.id', 'item_informations.listing_item_id');
                qb.innerJoin('item_categories', 'item_categories.id', 'item_informations.item_category_id');
                qb.where('item_informations.item_category_id', '=', categoryId);
                qb.where('item_categories.name', 'LIKE', '%' + searchTerm + '%');
                qb.andWhere('item_informations.item_category_id', '>', 0);
            })
            .orderBy('item_informations.title', 'ASC');

        if (withRelated) {
            return await listingCollection.fetchAll({
                withRelated: [
                    'ItemInformation',
                    'ItemInformation.ItemCategory',
                    'ItemInformation.ItemLocation',
                    'ItemInformation.ItemLocation.LocationMarker',
                    'ItemInformation.ItemImages',
                    'ItemInformation.ItemImages.ItemImageData',
                    'ItemInformation.ShippingDestinations',
                    'PaymentInformation',
                    'PaymentInformation.Escrow',
                    'PaymentInformation.Escrow.Ratio',
                    'PaymentInformation.ItemPrice',
                    'PaymentInformation.ItemPrice.ShippingPrice',
                    'PaymentInformation.ItemPrice.Address',
                    'MessagingInformation',
                    'ListingItemObjects'
                ]
            });
        } else {
            return await listingCollection.fetchAll();
        }
    }


    public get tableName(): string { return 'listing_items'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ItemInformation(): ItemInformation {
        return this.hasOne(ItemInformation);
    }

    public PaymentInformation(): PaymentInformation {
        return this.hasOne(PaymentInformation);
    }

    public MessagingInformation(): MessagingInformation {
        return this.hasOne(MessagingInformation);
    }

    public ListingItemObjects(): Collection<ListingItemObject> {
        return this.hasMany(ListingItemObject, 'listing_item_id', 'id');
    }
}
