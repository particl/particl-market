import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ItemInformation } from './ItemInformation';
import { PaymentInformation } from './PaymentInformation';
import { MessagingInformation } from './MessagingInformation';
import { ListingItemObject } from './ListingItemObject';
import { ListingItem } from './ListingItem';
import { Profile } from './Profile';
import { ListingItemTemplateSearchParams } from '../requests/ListingItemTemplateSearchParams';

export class ListingItemTemplate extends Bookshelf.Model<ListingItemTemplate> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ListingItemTemplate> {
        if (withRelated) {
            return await ListingItemTemplate.where<ListingItemTemplate>({ id: value }).fetch({
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
                    'ListingItemObjects',
                    'ListingItem',
                    'Profile'
                ]
            });
        } else {
            return await ListingItemTemplate.where<ListingItemTemplate>({ id: value }).fetch();
        }
    }

    public static async searchBy(options: ListingItemTemplateSearchParams, withRelated: boolean = true): Promise<Collection<ListingItemTemplate>> {
        const listingCollection = ListingItemTemplate.forge<Collection<ListingItemTemplate>>()
            .query(qb => {
                if (typeof options.category === 'number') {
                    qb.where('item_informations.item_category_id', '=', options.category);
                } else if (options.category && typeof options.category === 'string') {
                    qb.where('item_categories.key', '=', options.category);
                    qb.innerJoin('item_categories', 'item_categories.id', 'item_informations.item_category_id');
                }
                qb.innerJoin('item_informations', 'item_informations.listing_item_template_id', 'listing_item_templates.id');
                qb.where('item_informations.title', 'LIKE', '%' + options.searchString + '%');
                qb.where('profile_id', '=', options.profileId);
            })
            .orderBy('item_informations.title', options.order).query({
                limit: options.pageLimit,
                offset: (options.page - 1) * options.pageLimit
            });

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
                    'ListingItemObjects',
                    'ListingItem',
                    'Profile'
                ]
            });
        } else {
            return await listingCollection.fetchAll();
        }
    }

    public get tableName(): string { return 'listing_item_templates'; }
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
        return this.hasMany(ListingItemObject, 'listing_item_template_id', 'id');
    }

    public ListingItem(): Collection<ListingItem> {
        return this.hasMany(ListingItem, 'listing_item_template_id', 'id');
    }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

    // TODO: add related
    // public ListingItemTemplateRelated(): ListingItemTemplateRelated {
    //    return this.hasOne(ListingItemTemplateRelated);
    // }
}
