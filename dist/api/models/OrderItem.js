"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Order_1 = require("./Order");
const Bid_1 = require("./Bid");
const OrderItemObject_1 = require("./OrderItemObject");
class OrderItem extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield OrderItem.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield OrderItem.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'order_items'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Status() { return this.get('status'); }
    set Status(value) { this.set('status', value); }
    get ItemHash() { return this.get('item_hash'); }
    set ItemHash(value) { this.set('item_hash', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Order() {
        return this.belongsTo(Order_1.Order, 'order_id', 'id');
    }
    Bid() {
        return this.belongsTo(Bid_1.Bid, 'bid_id', 'id');
    }
    // public ListingItem(): ListingItem {
    //    return this.belongsTo(ListingItem, 'listing_item_id', 'id');
    // }
    OrderItemObjects() {
        return this.hasMany(OrderItemObject_1.OrderItemObject, 'order_item_id', 'id');
    }
}
OrderItem.RELATIONS = [
    'Order',
    'Bid',
    'Bid.ListingItem',
    'Bid.ListingItem.ListingItemTemplate',
    'Bid.ListingItem.PaymentInformation',
    'Bid.ListingItem.PaymentInformation.Escrow',
    'Bid.ListingItem.PaymentInformation.Escrow.Ratio',
    'Bid.ShippingAddress',
    'OrderItemObjects'
];
exports.OrderItem = OrderItem;
//# sourceMappingURL=OrderItem.js.map