import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { ShoppingCart } from './ShoppingCart';
import { ListingItem } from './ListingItem';
export declare class ShoppingCartItem extends Bookshelf.Model<ShoppingCartItem> {
    static RELATIONS: string[];
    static fetchById(value: number, withRelated?: boolean): Promise<ShoppingCartItem>;
    static findOneByListingItemOnCart(cartId: number, listingItemId: number, withRelated?: boolean): Promise<ShoppingCartItem>;
    static findListItemsByCartId(cartId: number, withRelated?: boolean): Promise<Collection<ShoppingCartItem>>;
    static clearCart(cartId: number): Promise<void>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    ShoppingCartId: number;
    ListingItemId: number;
    UpdatedAt: Date;
    CreatedAt: Date;
    ShoppingCart(): ShoppingCart;
    ListingItem(): ListingItem;
}
