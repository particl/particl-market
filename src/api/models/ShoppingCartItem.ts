// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
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
        'ListingItem.FlaggedItem',
        'ShoppingCart'
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

    public static async fetchByCartIdAndListingItemId(cartId: number, listingItemId: number, withRelated: boolean = true): Promise<ShoppingCartItem> {
        if (withRelated) {
            return await ShoppingCartItem.where<ShoppingCartItem>({ shopping_cart_id: cartId, listing_item_id: listingItemId }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ShoppingCartItem.where<ShoppingCartItem>({ shopping_cart_id: cartId, listing_item_id: listingItemId }).fetch();
        }
    }

    public static async fetchAllByCartId(cartId: number, withRelated: boolean = true): Promise<Collection<ShoppingCartItem>> {
        const ShoppingCartItemCollection = ShoppingCartItem.forge<Model<ShoppingCartItem>>()
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
