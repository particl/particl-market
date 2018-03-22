import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { ShoppingCart } from './ShoppingCart';
import { ListingItem } from './ListingItem';


export class ShoppingCartItem extends Bookshelf.Model<ShoppingCartItem> {

    public static RELATIONS = [
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
        'ListingItem.FlaggedItem'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ShoppingCartItem> {
        if (withRelated) {
            return await ShoppingCartItem.where<ShoppingCartItem>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ShoppingCartItem.where<ShoppingCartItem>({ id: value }).fetch();
        }
    }

    public static async findOneByListingItemOnCart(cartId: number, listingItemId: number, withRelated: boolean = true): Promise<ShoppingCartItem> {
        if (withRelated) {
            return await ShoppingCartItem.where<ShoppingCartItem>({ shopping_cart_id: cartId, listing_item_id: listingItemId }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ShoppingCartItem.where<ShoppingCartItem>({ shopping_cart_id: cartId, listing_item_id: listingItemId }).fetch();
        }
    }

    public static async findListItemsByCartId(cartId: number, withRelated: boolean = true): Promise<Collection<ShoppingCartItem>> {
        const ShoppingCartItemCollection = ShoppingCartItem.forge<Collection<ShoppingCartItem>>()
            .query(qb => {
                qb.where('shopping_cart_id', '=', cartId);
            })
            .orderBy('id', 'ASC');

        if (withRelated) {
            return await ShoppingCartItemCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await ShoppingCartItemCollection.fetchAll();
        }
    }

    public static async clearCart(cartId: number): Promise<void> {
        const ShoppingCartItemCollection = ShoppingCartItem.forge<ShoppingCartItem>()
            .query(qb => {
                qb.where('shopping_cart_id', '=', cartId);
            });
        await ShoppingCartItemCollection.destroy();
        return;
    }

    public get tableName(): string { return 'shopping_cart_item'; }
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

    public ShoppingCart(): ShoppingCart {
        return this.belongsTo(ShoppingCart, 'shopping_cart_id', 'id');
    }

    public ListingItem(): ListingItem {
        return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    }
}
