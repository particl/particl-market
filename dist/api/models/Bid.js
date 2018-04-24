"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const _ = require("lodash");
const ListingItem_1 = require("./ListingItem");
const BidData_1 = require("./BidData");
const SearchOrder_1 = require("../enums/SearchOrder");
const Address_1 = require("./Address");
const OrderItem_1 = require("./OrderItem");
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
            if (!options.ordering) {
                options.ordering = SearchOrder_1.SearchOrder.ASC;
            }
            const bidCollection = Bid.forge()
                .query(qb => {
                if (options.listingItemId) {
                    qb.where('bids.listing_item_id', '=', options.listingItemId);
                }
                if (options.action && typeof options.action === 'string') {
                    qb.where('bids.action', '=', options.action);
                }
                if (!_.isEmpty(options.bidders)) {
                    qb.whereIn('bids.bidder', options.bidders);
                    /*
                                        let firstIteration = true;
                                        for (const bidder of options.bidders) {
                                            if (firstIteration) {
                                                qb.where('bids.bidder', '=', bidder);
                                            } else {
                                                firstIteration = false;
                                                qb.orWhere('bids.bidder', '=', bidder);
                                            }
                                        }
                    */
                }
            }).orderBy('bids.created_at', options.ordering);
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
    static getLatestBid(listingItemId, bidder) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield Bid.where({ listing_item_id: listingItemId, bidder }).orderBy('created_at', 'DESC').fetch();
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