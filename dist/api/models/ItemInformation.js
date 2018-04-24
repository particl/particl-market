"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ItemLocation_1 = require("./ItemLocation");
const ItemImage_1 = require("./ItemImage");
const ShippingDestination_1 = require("./ShippingDestination");
const ItemCategory_1 = require("./ItemCategory");
const ListingItemTemplate_1 = require("./ListingItemTemplate");
const ListingItem_1 = require("./ListingItem");
class ItemInformation extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ItemInformation.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ItemInformation.where({ id: value }).fetch();
            }
        });
    }
    static findByItemTemplateId(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ItemInformation.where({ listing_item_template_id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ItemInformation.where({ listing_item_template_id: value }).fetch();
            }
        });
    }
    get tableName() { return 'item_informations'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Title() { return this.get('title'); }
    set Title(value) { this.set('title', value); }
    get ShortDescription() { return this.get('shortDescription'); }
    set ShortDescription(value) { this.set('shortDescription', value); }
    get LongDescription() { return this.get('longDescription'); }
    set LongDescription(value) { this.set('longDescription', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ItemCategory() {
        return this.belongsTo(ItemCategory_1.ItemCategory, 'item_category_id', 'id');
    }
    ItemLocation() {
        return this.hasOne(ItemLocation_1.ItemLocation);
    }
    ItemImages() {
        return this.hasMany(ItemImage_1.ItemImage, 'item_information_id', 'id');
    }
    ShippingDestinations() {
        return this.hasMany(ShippingDestination_1.ShippingDestination, 'item_information_id', 'id');
    }
    ListingItemTemplate() {
        return this.belongsTo(ListingItemTemplate_1.ListingItemTemplate, 'listing_item_template_id', 'id');
    }
    ListingItem() {
        return this.belongsTo(ListingItem_1.ListingItem, 'listing_item_id', 'id');
    }
}
ItemInformation.RELATIONS = [
    'ItemCategory',
    'ItemLocation',
    'ItemLocation.LocationMarker',
    'ItemImages',
    'ItemImages.ItemImageDatas',
    'ShippingDestinations'
];
exports.ItemInformation = ItemInformation;
//# sourceMappingURL=ItemInformation.js.map