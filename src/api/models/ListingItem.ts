import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ItemInformation } from './ItemInformation';
import { PaymentInformation } from './PaymentInformation';
import { MessagingInformation } from './MessagingInformation';
import { ListingItemObject } from './ListingItemObject';
import { ListingItemSearchParams } from '../requests/ListingItemSearchParams';
import { FavoriteItem } from './FavoriteItem';
import { ListingItemTemplate } from './ListingItemTemplate';
import { Bid } from './Bid';
import { FlaggedItem } from './FlaggedItem';
import { Market } from './Market';
import { ShoppingCartItems } from './ShoppingCartItems';

export class ListingItem extends Bookshelf.Model<ListingItem> {

    public static RELATIONS = [
        'ItemInformation',
        'ItemInformation.ItemCategory',
        'ItemInformation.ItemLocation',
        'ItemInformation.ItemLocation.LocationMarker',
        'ItemInformation.ItemImages',
        'ItemInformation.ItemImages.ItemImageDatas',
        'ItemInformation.ShippingDestinations',
        'PaymentInformation',
        'PaymentInformation.Escrow',
        'PaymentInformation.Escrow.Ratio',
        'PaymentInformation.ItemPrice',
        'PaymentInformation.ItemPrice.ShippingPrice',
        'PaymentInformation.ItemPrice.CryptocurrencyAddress',
        'MessagingInformation',
        'ListingItemObjects',
        'Bids',
        'Market',
        'FlaggedItem'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ListingItem> {
        if (withRelated) {
            return await ListingItem.where<ListingItem>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ListingItem.where<ListingItem>({ id: value }).fetch();
        }
    }

    public static async fetchByHash(value: string): Promise<ListingItem> {
        return await ListingItem.where<ListingItem>({ hash: value }).fetch({
            withRelated: this.RELATIONS
        });
    }

    public static async fetchByCategory(categoryId: number, withRelated: boolean = true): Promise<Collection<ListingItem>> {

        const listingCollection = ListingItem.forge<Collection<ListingItem>>()
            .query(qb => {
                qb.innerJoin('item_informations', 'listing_items.id', 'item_informations.listing_item_id');
                qb.where('item_informations.item_category_id', '=', categoryId);
                qb.andWhere('item_informations.item_category_id', '>', 0);
            })
            .orderBy('item_informations.title', 'ASC');

        if (withRelated) {
            return await listingCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await listingCollection.fetchAll();
        }
    }

    public static async searchBy(options: ListingItemSearchParams, withRelated: boolean = false): Promise<Collection<ListingItem>> {
        const listingCollection = ListingItem.forge<Collection<ListingItem>>()
            .query(qb => {
                if (typeof options.category === 'number') {
                    qb.where('item_informations.item_category_id', '=', options.category);
                } else if (options.category && typeof options.category === 'string') {
                    qb.where('item_categories.key', '=', options.category);
                    qb.innerJoin('item_categories', 'item_categories.id', 'item_informations.item_category_id');
                }

                // search by profile
                if (typeof options.profileId === 'number') {
                    qb.innerJoin('listing_item_templates', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                    qb.where('listing_item_templates.profile_id', '=', options.profileId);
                }

                // search by item price
                if (typeof options.minPrice === 'number' && typeof options.maxPrice === 'number') {
                    qb.innerJoin('payment_informations', 'payment_informations.listing_item_id', 'listing_items.id');
                    qb.innerJoin('item_prices', 'payment_informations.id', 'item_prices.payment_information_id');
                    qb.whereBetween('item_prices.base_price', [options.minPrice, options.maxPrice]);
                }

                qb.innerJoin('item_informations', 'item_informations.listing_item_id', 'listing_items.id');

                // search by item location (country)
                if (options.country && typeof options.country === 'string' ) {
                    qb.innerJoin('item_locations', 'item_informations.id', 'item_locations.item_information_id');
                    qb.where('item_locations.region', options.country);
                }

                // search by shipping destination
                if (options.shippingDestination && typeof options.shippingDestination === 'string' ) {
                    qb.innerJoin('shipping_destinations', 'item_informations.id', 'shipping_destinations.item_information_id');
                    qb.where('shipping_destinations.country', options.shippingDestination);
                }

                qb.where('item_informations.title', 'LIKE', '%' + options.searchString + '%');
                qb.groupBy('listing_items.id');

            })
            .orderBy('item_informations.title', options.order).query({
                limit: options.pageLimit,
                offset: (options.page - 1) * options.pageLimit
            });

        if (withRelated) {
            return await listingCollection.fetchAll({
                withRelated: this.RELATIONS
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

    public MessagingInformation(): Collection<MessagingInformation> {
        return this.hasMany(MessagingInformation, 'listing_item_id', 'id');
    }

    public ListingItemObjects(): Collection<ListingItemObject> {
        return this.hasMany(ListingItemObject, 'listing_item_id', 'id');
    }

    public FavoriteItems(): Collection<FavoriteItem> {
        return this.hasMany(FavoriteItem, 'listing_item_id', 'id');
    }

    public ListingItemTemplate(): ListingItemTemplate {
        return this.belongsTo(ListingItemTemplate, 'listing_item_template_id', 'id');
    }

    public Bids(): Collection<Bid> {
        return this.hasMany(Bid, 'listing_item_id', 'id');
    }

    public Market(): Market {
        return this.belongsTo(Market, 'market_id', 'id');
    }

    public FlaggedItem(): FlaggedItem {
        return this.hasOne(FlaggedItem);
    }

    public ShoppingCartItems(): Collection<ShoppingCartItems> {
        return this.hasMany(ShoppingCartItems, 'listing_item_id', 'id');
    }

}
