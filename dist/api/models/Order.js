"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const OrderItem_1 = require("./OrderItem");
const Address_1 = require("./Address");
const SearchOrder_1 = require("../enums/SearchOrder");
class Order extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Order.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Order.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'orders'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Hash() { return this.get('hash'); }
    set Hash(value) { this.set('hash', value); }
    get Buyer() { return this.get('buyer'); }
    set Buyer(value) { this.set('buyer', value); }
    get Seller() { return this.get('seller'); }
    set Seller(value) { this.set('seller', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    static search(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.ordering) {
                options.ordering = SearchOrder_1.SearchOrder.ASC;
            }
            const orderCollection = Order.forge()
                .query(qb => {
                qb.join('order_items', 'orders.id', 'order_items.order_id');
                if (options.listingItemId) {
                    qb.join('bids', 'order_items.bid_id', 'bids.id');
                    qb.where('bids.listing_item_id', '=', options.listingItemId);
                }
                if (options.status && typeof options.status === 'string') {
                    qb.where('order_items.status', '=', options.status);
                }
                if (options.buyerAddress && typeof options.buyerAddress === 'string') {
                    qb.where('orders.buyer', '=', options.buyerAddress);
                }
                if (options.sellerAddress && typeof options.sellerAddress === 'string') {
                    qb.where('orders.seller', '=', options.sellerAddress);
                }
            }).orderBy('orders.created_at', options.ordering);
            if (withRelated) {
                return yield orderCollection.fetchAll({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield orderCollection.fetchAll();
            }
        });
    }
    OrderItems() {
        return this.hasMany(OrderItem_1.OrderItem, 'order_id', 'id');
    }
    ShippingAddress() {
        return this.belongsTo(Address_1.Address, 'address_id', 'id');
    }
}
Order.RELATIONS = [
    'OrderItems',
    'OrderItems.Bid',
    'OrderItems.Bid.ListingItem',
    'OrderItems.OrderItemObjects',
    'OrderItems.Bid.ListingItem.ListingItemTemplate',
    'OrderItems.Bid.ListingItem.PaymentInformation',
    'OrderItems.Bid.ListingItem.PaymentInformation.Escrow',
    'OrderItems.Bid.ListingItem.PaymentInformation.Escrow.Ratio',
    'OrderItems.Bid.ShippingAddress',
    'ShippingAddress'
];
exports.Order = Order;
//# sourceMappingURL=Order.js.map