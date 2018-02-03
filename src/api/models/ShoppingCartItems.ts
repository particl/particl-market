import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { ShoppingCarts } from './ShoppingCarts';
import { ListingItem } from './ListingItem';


export class ShoppingCartItems extends Bookshelf.Model<ShoppingCartItems> {

    public static RELATIONS = [
        'ShoppingCarts',
        'ListingItem'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ShoppingCartItems> {
        if (withRelated) {
            return await ShoppingCartItems.where<ShoppingCartItems>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ShoppingCartItems.where<ShoppingCartItems>({ id: value }).fetch();
        }
    }

    public static async findOneByListingItemOnCart(cartId: number, listingItemId: number, withRelated: boolean = true): Promise<ShoppingCartItems> {
        if (withRelated) {
            return await ShoppingCartItems.where<ShoppingCartItems>({ shopping_cart_id: cartId, listing_item_id: listingItemId }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ShoppingCartItems.where<ShoppingCartItems>({ shopping_cart_id: cartId, listing_item_id: listingItemId }).fetch();
        }
    }

    public static async findListItemsByCartId(cartId: number, withRelated: boolean = true): Promise<Collection<ShoppingCartItems>> {
        const ShoppingCartItemsCollection = ShoppingCartItems.forge<Collection<ShoppingCartItems>>()
            .query(qb => {
                qb.where('shopping_cart_id', '=', cartId);
            })
            .orderBy('id', 'ASC');

        if (withRelated) {
            return await ShoppingCartItemsCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await ShoppingCartItemsCollection.fetchAll();
        }
    }

    public static async clearCart(cartId: number): Promise<void> {
        const ShoppingCartItemsCollection = ShoppingCartItems.forge<ShoppingCartItems>()
            .query(qb => {
                qb.where('shopping_cart_id', '=', cartId);
            });
        await ShoppingCartItemsCollection.destroy();
        return;
    }

    public get tableName(): string { return 'shopping_cart_items'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get ShoppingCartId(): number { return this.get('shopping_cart_id'); }
    public set ShoppingCartId(value: number) { this.set('shopping_cart_id', value); }

    public get ListingItemId(): number { return this.get('listing_item_id'); }
    public set ListingItemId(value: number) { this.set('listing_item_id', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ShoppingCarts(): ShoppingCarts {
        return this.belongsTo(ShoppingCarts, 'shopping_cart_id', 'id');
    }

    public ListingItem(): ListingItem {
        return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }
}
