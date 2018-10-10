"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const _ = require("lodash");
const ListingItem_1 = require("./ListingItem");
const BidData_1 = require("./BidData");
const BidMessageType_1 = require("../enums/BidMessageType");
const SearchOrder_1 = require("../enums/SearchOrder");
const Address_1 = require("./Address");
const OrderItem_1 = require("./OrderItem");
const OrderStatus_1 = require("../enums/OrderStatus");
class Bid extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Bid.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Bid.where({ id: value }).fetch();
            }
        });
    }
    static search(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            options.ordering = options.ordering ? options.ordering : SearchOrder_1.SearchOrder.ASC;
            options.page = options.page ? options.page : 0;
            options.pageLimit = options.pageLimit ? options.pageLimit : 10;
            const bidCollection = Bid.forge()
                .query(qb => {
                if (options.listingItemId) {
                    qb.where('bids.listing_item_id', '=', options.listingItemId);
                }
                if (options.status
                    && (options.status === BidMessageType_1.BidMessageType.MPA_ACCEPT
                        || options.status === BidMessageType_1.BidMessageType.MPA_BID
                        || options.status === BidMessageType_1.BidMessageType.MPA_CANCEL
                        || options.status === BidMessageType_1.BidMessageType.MPA_REJECT)) {
                    qb.where('bids.action', '=', options.status);
                }
                if (options.status
                    && (options.status === OrderStatus_1.OrderStatus.AWAITING_ESCROW
                        || options.status === OrderStatus_1.OrderStatus.COMPLETE
                        || options.status === OrderStatus_1.OrderStatus.ESCROW_LOCKED
                        || options.status === OrderStatus_1.OrderStatus.SHIPPING)) {
                    qb.innerJoin('order_items', 'order_items.bid_id', 'bids.id');
                    qb.where('order_items.status', '=', options.status);
                }
                if (options.searchString) {
                    qb.innerJoin('item_informations', 'item_informations.listing_item_id', 'bids.listing_item_id');
                    qb.where('item_informations.title', 'LIKE', '%' + options.searchString + '%')
                        .orWhere('item_informations.short_description', 'LIKE', '%' + options.searchString + '%')
                        .orWhere('item_informations.long_description', 'LIKE', '%' + options.searchString + '%');
                }
                if (!_.isEmpty(options.bidders)) {
                    qb.whereIn('bids.bidder', options.bidders);
                }
            })
                .orderBy('bids.updated_at', options.ordering)
                .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
            });
            if (withRelated) {
                return yield bidCollection.fetchAll({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield bidCollection.fetchAll();
            }
        });
    }
    get tableName() { return 'bids'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Action() { return this.get('action'); }
    set Action(value) { this.set('action', value); }
    get Bidder() { return this.get('bidder'); }
    set Bidder(value) { this.set('bidder', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    BidDatas() {
        return this.hasMany(BidData_1.BidData, 'bid_id', 'id');
    }
    ShippingAddress() {
        return this.belongsTo(Address_1.Address, 'address_id', 'id');
    }
    OrderItem() {
        return this.hasOne(OrderItem_1.OrderItem);
    }
    ListingItem() {
        return this.belongsTo(ListingItem_1.ListingItem, 'listing_item_id', 'id');
    }
}
Bid.RELATIONS = [
    'BidDatas',
    'ShippingAddress',
    'ShippingAddress.Profile',
    'ListingItem',
    'ListingItem.ListingItemTemplate',
    'OrderItem',
    'OrderItem.OrderItemObjects',
    'OrderItem.Order'
];
exports.Bid = Bid;
//# sourceMappingURL=Bid.js.map