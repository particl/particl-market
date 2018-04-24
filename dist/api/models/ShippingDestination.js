"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ItemInformation_1 = require("./ItemInformation");
class ShippingDestination extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ShippingDestination.where({ id: value }).fetch({
                    withRelated: [
                        'ItemInformation',
                        'ItemInformation.ListingItem',
                        'ItemInformation.ListingItemTemplate'
                    ]
                });
            }
            else {
                return yield ShippingDestination.where({ id: value }).fetch();
            }
        });
    }
    static searchBy(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield ShippingDestination.where({
                country: options.country, shipping_availability: options.shippingAvailability, item_information_id: options.item_information_id
            }).fetch();
        });
    }
    get tableName() { return 'shipping_destinations'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Country() { return this.get('country'); }
    set Country(value) { this.set('country', value); }
    get ShippingAvailability() { return this.get('shippingAvailability'); }
    set ShippingAvailability(value) { this.set('shippingAvailability', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ItemInformation() {
        return this.belongsTo(ItemInformation_1.ItemInformation, 'item_information_id', 'id');
    }
}
exports.ShippingDestination = ShippingDestination;
//# sourceMappingURL=ShippingDestination.js.map