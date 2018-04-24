"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ListingItem_1 = require("./ListingItem");
const ListingItemTemplate_1 = require("./ListingItemTemplate");
const ListingItemObjectData_1 = require("./ListingItemObjectData");
class ListingItemObject extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ListingItemObject.where({ id: value }).fetch({
                    withRelated: [
                        'ListingItem',
                        'ListingItemTemplate',
                        'ListingItemObjectDatas'
                    ]
                });
            }
            else {
                return yield ListingItemObject.where({ id: value }).fetch();
            }
        });
    }
    static searchBy(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingCollection = ListingItemObject.forge()
                .query(qb => {
                qb.where('listing_item_objects.type', 'LIKE', '%' + options.searchString + '%');
                qb.orWhere('listing_item_objects.description', 'LIKE', '%' + options.searchString + '%');
            })
                .orderBy('listing_item_objects.id', 'ASC');
            return yield listingCollection.fetchAll();
        });
    }
    get tableName() { return 'listing_item_objects'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Type() { return this.get('type'); }
    set Type(value) { this.set('type', value); }
    get ObjectId() { return this.get('object_id'); }
    set ObjectId(value) { this.set('object_id', value); }
    get ForceInput() { return this.get('force_input'); }
    set ForceInput(value) { this.set('force_input', value); }
    get Description() { return this.get('description'); }
    set Description(value) { this.set('description', value); }
    get Order() { return this.get('order'); }
    set Order(value) { this.set('order', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ListingItem() {
        return this.belongsTo(ListingItem_1.ListingItem, 'listing_item_id', 'id');
    }
    ListingItemTemplate() {
        return this.belongsTo(ListingItemTemplate_1.ListingItemTemplate, 'listing_item_template_id', 'id');
    }
    ListingItemObjectDatas() {
        return this.hasMany(ListingItemObjectData_1.ListingItemObjectData, 'listing_item_object_id', 'id');
    }
}
exports.ListingItemObject = ListingItemObject;
//# sourceMappingURL=ListingItemObject.js.map