"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const LocationMarker_1 = require("./LocationMarker");
class ItemLocation extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ItemLocation.where({ id: value }).fetch({
                    withRelated: [
                        'LocationMarker'
                    ]
                });
            }
            else {
                return yield ItemLocation.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'item_locations'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Region() { return this.get('region'); }
    set Region(value) { this.set('region', value); }
    get Address() { return this.get('address'); }
    set Address(value) { this.set('address', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    LocationMarker() {
        return this.hasOne(LocationMarker_1.LocationMarker);
    }
}
exports.ItemLocation = ItemLocation;
//# sourceMappingURL=ItemLocation.js.map