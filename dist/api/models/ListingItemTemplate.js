"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ItemInformation_1 = require("./ItemInformation");
const PaymentInformation_1 = require("./PaymentInformation");
const MessagingInformation_1 = require("./MessagingInformation");
const ListingItemObject_1 = require("./ListingItemObject");
const ListingItem_1 = require("./ListingItem");
const Profile_1 = require("./Profile");
class ListingItemTemplate extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ListingItemTemplate.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ListingItemTemplate.where({ id: value }).fetch();
            }
        });
    }
    static fetchByHash(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ListingItemTemplate.where({ hash: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ListingItemTemplate.where({ hash: value }).fetch();
            }
        });
    }
    static searchBy(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingCollection = ListingItemTemplate.forge()
                .query(qb => {
                if (typeof options.category === 'number') {
                    qb.where('item_informations.item_category_id', '=', options.category);
                }
                else if (options.category && typeof options.category === 'string') {
                    qb.where('item_categories.key', '=', options.category);
                    qb.innerJoin('item_categories', 'item_categories.id', 'item_informations.item_category_id');
                }
                if (options.profileId) {
                    qb.where('profile_id', '=', options.profileId);
                }
                qb.innerJoin('item_informations', 'item_informations.listing_item_template_id', 'listing_item_templates.id');
                if (options.searchString) {
                    qb.where('item_informations.title', 'LIKE', '%' + options.searchString + '%');
                }
            })
                .orderBy('item_informations.title', options.order).query({
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
    get tableName() { return 'listing_item_templates'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Hash() { return this.get('hash'); }
    set Hash(value) { this.set('hash', value); }
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
        return this.hasMany(MessagingInformation_1.MessagingInformation, 'listing_item_template_id', 'id');
    }
    ListingItemObjects() {
        return this.hasMany(ListingItemObject_1.ListingItemObject, 'listing_item_template_id', 'id');
    }
    ListingItems() {
        return this.hasMany(ListingItem_1.ListingItem, 'listing_item_template_id', 'id');
    }
    Profile() {
        return this.belongsTo(Profile_1.Profile, 'profile_id', 'id');
    }
}
ListingItemTemplate.RELATIONS = [
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
    'ListingItems',
    'ListingItems.PaymentInformation',
    'ListingItems.PaymentInformation.ItemPrice',
    'ListingItems.PaymentInformation.ItemPrice.ShippingPrice',
    'ListingItems.ItemInformation',
    'ListingItems.ItemInformation.ItemLocation',
    'ListingItems.ItemInformation.ItemCategory',
    'ListingItems.ItemInformation.ItemCategory.ParentItemCategory',
    'ListingItems.ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory',
    'ListingItems.ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
    'ListingItems.ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
    'ListingItems.ItemInformation.ShippingDestinations',
    'Profile'
];
exports.ListingItemTemplate = ListingItemTemplate;
//# sourceMappingURL=ListingItemTemplate.js.map