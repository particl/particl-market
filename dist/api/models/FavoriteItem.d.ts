import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { Profile } from './Profile';
import { ListingItem } from './ListingItem';
import { FavoriteSearchParams } from '../requests/FavoriteSearchParams';
export declare class FavoriteItem extends Bookshelf.Model<FavoriteItem> {
    static fetchById(value: number, withRelated?: boolean): Promise<FavoriteItem>;
    static search(options: FavoriteSearchParams): Promise<FavoriteItem>;
    static findFavoritesByProfileId(profileId: number, withRelated?: boolean): Promise<Collection<FavoriteItem>>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    profileId: number;
    listingItemId: number;
    UpdatedAt: Date;
    CreatedAt: Date;
    Profile(): Profile;
    ListingItem(): ListingItem;
}
