"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
class LocationMarker extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield LocationMarker.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield LocationMarker.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'location_markers'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get MarkerTitle() { return this.get('markerTitle'); }
    set MarkerTitle(value) { this.set('markerTitle', value); }
    get MarkerText() { return this.get('markerText'); }
    set MarkerText(value) { this.set('markerText', value); }
    get Lat() { return this.get('lat'); }
    set Lat(value) { this.set('lat', value); }
    get Lng() { return this.get('lng'); }
    set Lng(value) { this.set('lng', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
}
exports.LocationMarker = LocationMarker;
//# sourceMappingURL=LocationMarker.js.map