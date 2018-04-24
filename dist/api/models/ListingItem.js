"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ItemInformation_1 = require("./ItemInformation");
const PaymentInformation_1 = require("./PaymentInformation");
const MessagingInformation_1 = require("./MessagingInformation");
const ListingItemObject_1 = require("./ListingItemObject");
const FavoriteItem_1 = require("./FavoriteItem");
const ListingItemTemplate_1 = require("./ListingItemTemplate");
const Bid_1 = require("./Bid");
const FlaggedItem_1 = require("./FlaggedItem");
const Market_1 = require("./Market");
const ShoppingCartItem_1 = require("./ShoppingCartItem");
const ActionMessage_1 = require("./ActionMessage");
class ListingItem extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ListingItem.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ListingItem.where({ id: value }).fetch();
            }
        });
    }
    static fetchByHash(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ListingItem.where({ hash: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ListingItem.where({ hash: value }).fetch();
            }
        });
    }
    static fetchByCategory(categoryId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingCollection = ListingItem.forge()
                .query(qb => {
                qb.innerJoin('item_informations', 'listing_items.id', 'item_informations.listing_item_id');
                qb.where('item_informations.item_category_id', '=', categoryId);
                qb.andWhere('item_informations.item_category_id', '>', 0);
            })
                .orderBy('item_informations.title', 'ASC');
            if (withRelated) {
                return yield listingCollection.fetchAll({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield listingCollection.fetchAll();
            }
        });
    }
    static searchBy(options, withRelated = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingCollection = ListingItem.forge()
                .query(qb => {
                if (typeof options.category === 'number') {
                    qb.where('item_informations.item_category_id', '=', options.category);
                }
                else if (options.category && typeof options.category === 'string') {
                    qb.where('item_categories.key', '=', options.category);
                    qb.innerJoin('item_categories', 'item_categories.id', 'item_informations.item_category_id');
                }
                // search by profile
                if (typeof options.profileId === 'number') {
                    qb.innerJoin('listing_item_templates', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                    qb.where('listing_item_templates.profile_id', '=', options.profileId);
                }
                else if (options.profileId === 'OWN') {
                    qb.innerJoin('listing_item_templates', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                }
                // search by item price
                if (typeof options.minPrice === 'number' && typeof options.maxPrice === 'number') {
                    qb.innerJoin('payment_informations', 'payment_informations.listing_item_id', 'listing_items.id');
                    qb.innerJoin('item_prices', 'payment_informations.id', 'item_prices.payment_information_id');
                    qb.whereBetween('item_prices.base_price', [options.minPrice, options.maxPrice]);
                }
                qb.innerJoin('item_informations', 'item_informations.listing_item_id', 'listing_items.id');
                // search by item location (country)
                if (options.country && typeof options.country === 'string') {
                    qb.innerJoin('item_locations', 'item_informations.id', 'item_locations.item_information_id');
                    qb.where('item_locations.region', options.country);
                }
                // search by shipping destination
                if (options.shippingDestination && typeof options.shippingDestination === 'string') {
                    qb.innerJoin('shipping_destinations', 'item_informations.id', 'shipping_destinations.item_information_id');
                    qb.where('shipping_destinations.country', options.shippingDestination);
                }
                qb.where('item_informations.title', 'LIKE', '%' + options.searchString + '%');
                qb.groupBy('listing_items.id');
            })
                .orderBy('updated_at', options.order)
                .query({
                limit: options.pageLimit,
                offset: (options.page - 1) * options.pageLimit
            });
            if (withRelated) {
                return yield listingCollection.fetchAll({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield listingCollection.fetchAll();
            }
        });
    }
    get tableName() { return 'listing_items'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Hash() { return this.get('hash'); }
    set Hash(value) { this.set('hash', value); }
    get Seller() { return this.get('seller'); }
    set Seller(value) { this.set('seller', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ItemInformation() {
        return this.hasOne(ItemInformation_1.ItemInformation);
    }
    PaymentInformation() {
        return this.hasOne(PaymentInformation_1.PaymentInformation);
    }
    MessagingInformation() {
        return this.hasMany(MessagingInformation_1.MessagingInformation, 'listing_item_id', 'id');
    }
    ListingItemObjects() {
        return this.hasMany(ListingItemObject_1.ListingItemObject, 'listing_item_id', 'id');
    }
    FavoriteItems() {
        return this.hasMany(FavoriteItem_1.FavoriteItem, 'listing_item_id', 'id');
    }
    ListingItemTemplate() {
        return this.belongsTo(ListingItemTemplate_1.ListingItemTemplate, 'listing_item_template_id', 'id');
    }
    Bids() {
        return this.hasMany(Bid_1.Bid, 'listing_item_id', 'id');
    }
    Market() {
        return this.belongsTo(Market_1.Market, 'market_id', 'id');
    }
    FlaggedItem() {
        return this.hasOne(FlaggedItem_1.FlaggedItem);
    }
    ShoppingCartItem() {
        return this.hasMany(ShoppingCartItem_1.ShoppingCartItem, 'listing_item_id', 'id');
    }
    ActionMessages() {
        return this.hasMany(ActionMessage_1.ActionMessage, 'listing_item_id', 'id');
    }
}
ListingItem.RELATIONS = [
    'ItemInformation',
    'ItemInformation.ItemCategory',
    'ItemInformation.ItemCategory.ParentItemCategory',
    'ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory',
    'ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
    'ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
    'ItemInformation.ItemLocation',
    'ItemInformation.ItemLocation.LocationMarker',
    'ItemInformation.ItemImages',
    'ItemInformation.ItemImages.ItemImageDatas',
    'ItemInformation.ShippingDestinations',
    'PaymentInformation',
    'PaymentInformation.Escrow',
    'PaymentInformation.Escrow.Ratio',
    'PaymentInformation.ItemPrice',
    'PaymentInformation.ItemPrice.ShippingPrice',
    'PaymentInformation.ItemPrice.CryptocurrencyAddress',
    'MessagingInformation',
    'ListingItemObjects',
    'ListingItemObjects.ListingItemObjectDatas',
    'ActionMessages',
    'ActionMessages.MessageObjects',
    'ActionMessages.MessageInfo',
    'ActionMessages.MessageEscrow',
    'ActionMessages.MessageData',
    'Bids',
    'Bids.BidDatas',
    'Market',
    'FlaggedItem',
    'ListingItemTemplate',
    'ListingItemTemplate.Profile'
];
exports.ListingItem = ListingItem;
//# sourceMappingURL=ListingItem.js.map