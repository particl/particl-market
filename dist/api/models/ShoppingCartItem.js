"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ShoppingCart_1 = require("./ShoppingCart");
const ListingItem_1 = require("./ListingItem");
class ShoppingCartItem extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ShoppingCartItem.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ShoppingCartItem.where({ id: value }).fetch();
            }
        });
    }
    static findOneByListingItemOnCart(cartId, listingItemId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ShoppingCartItem.where({ shopping_cart_id: cartId, listing_item_id: listingItemId }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ShoppingCartItem.where({ shopping_cart_id: cartId, listing_item_id: listingItemId }).fetch();
            }
        });
    }
    static findListItemsByCartId(cartId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ShoppingCartItemCollection = ShoppingCartItem.forge()
                .query(qb => {
                qb.where('shopping_cart_id', '=', cartId);
            })
                .orderBy('id', 'ASC');
            if (withRelated) {
                return yield ShoppingCartItemCollection.fetchAll({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ShoppingCartItemCollection.fetchAll();
            }
        });
    }
    static clearCart(cartId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ShoppingCartItemCollection = ShoppingCartItem.forge()
                .query(qb => {
                qb.where('shopping_cart_id', '=', cartId);
            });
            yield ShoppingCartItemCollection.destroy();
            return;
        });
    }
    get tableName() { return 'shopping_cart_item'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get ShoppingCartId() { return this.get('shopping_cart_id'); }
    set ShoppingCartId(value) { this.set('shopping_cart_id', value); }
    get ListingItemId() { return this.get('listing_item_id'); }
    set ListingItemId(value) { this.set('listing_item_id', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ShoppingCart() {
        return this.belongsTo(ShoppingCart_1.ShoppingCart, 'shopping_cart_id', 'id');
    }
    ListingItem() {
        return this.belongsTo(ListingItem_1.ListingItem, 'listing_item_id', 'id');
    }
}
ShoppingCartItem.RELATIONS = [
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
exports.ShoppingCartItem = ShoppingCartItem;
//# sourceMappingURL=ShoppingCartItem.js.map