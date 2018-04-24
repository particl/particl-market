"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ListingItemObject_1 = require("./ListingItemObject");
class ListingItemObjectData extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ListingItemObjectData.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield ListingItemObjectData.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'listing_item_object_datas'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Key() { return this.get('key'); }
    set Key(value) { this.set('key', value); }
    get Value() { return this.get('value'); }
    set Value(value) { this.set('value', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ListingItemObject() {
        return this.belongsTo(ListingItemObject_1.ListingItemObject, 'listing_item_object_id', 'id');
    }
}
exports.ListingItemObjectData = ListingItemObjectData;
//# sourceMappingURL=ListingItemObjectData.js.map