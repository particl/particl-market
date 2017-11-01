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

    public get tableName(): string { return 'listing_items'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

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
