import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { Profile } from './Profile';
import { ListingItem } from './ListingItem';
import { FavoriteSearchParams } from '../requests/FavoriteSearchParams';

export class FavoriteItem extends Bookshelf.Model<FavoriteItem> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<FavoriteItem> {
        if (withRelated) {
            return await FavoriteItem.where<FavoriteItem>({ id: value }).fetch({
                withRelated: [
                    'ListingItem',
                    'Profile'
                ]
            });
        } else {
            return await FavoriteItem.where<FavoriteItem>({ id: value }).fetch();
        }
    }

    // find favorite by profile id and listing item id
    public static async search(options: FavoriteSearchParams): Promise<FavoriteItem> {
        return await FavoriteItem.where<FavoriteItem>({ listing_item_id: options.itemId, profile_id: options.profileId }).fetch();
    }

    public static async findFavoritesByProfileId(profileId: number, withRelated: boolean = true): Promise<Collection<FavoriteItem>> {
        const favoriteItems = FavoriteItem.forge<Collection<FavoriteItem>>()
            .query(qb => {
                qb.where('profile_id', '=', profileId);
            })
            .orderBy('id', 'ASC');

        if (withRelated) {
            return await favoriteItems.fetchAll({
                withRelated: [
                    'ListingItem',
                    'ListingItem.ItemInformation',
                    'ListingItem.ItemInformation.ItemCategory',
                    'ListingItem.ItemInformation.ItemLocation',
                    'ListingItem.ItemInformation.ItemLocation.LocationMarker',
                    'ListingItem.ItemInformation.ItemImages',
                    'ListingItem.ItemInformation.ItemImages.ItemImageDatas',
                    'ListingItem.ItemInformation.ShippingDestinations',
                    'ListingItem.PaymentInformation',
                    'ListingItem.PaymentInformation.Escrow',
                    'ListingItem.PaymentInformation.Escrow.Ratio',
                    'ListingItem.PaymentInformation.ItemPrice',
                    'ListingItem.PaymentInformation.ItemPrice.ShippingPrice',
                    'ListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress',
                    'ListingItem.MessagingInformation',
                    'ListingItem.ListingItemObjects',
                    'ListingItem.Bids',
                    'ListingItem.Market',
                    'ListingItem.FlaggedItem',
                    'Profile'
                ]
            });
        } else {
            return await favoriteItems.fetchAll();
        }
    }

    public get tableName(): string { return 'favorite_items'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get profileId(): number { return this.get('profile_id'); }
    public set profileId(value: number) { this.set('profile_id', value); }

    public get listingItemId(): number { return this.get('listing_item_id'); }
    public set listingItemId(value: number) { this.set('listing_item_id', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Profile(): Profile {
      return this.belongsTo(Profile, 'profile_id', 'id');
    }

    public ListingItem(): ListingItem {
      return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }
}
