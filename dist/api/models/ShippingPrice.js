"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
class ShippingPrice extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ShippingPrice.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield ShippingPrice.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'shipping_prices'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Domestic() { return this.get('domestic'); }
    set Domestic(value) { this.set('domestic', value); }
    get International() { return this.get('international'); }
    set International(value) { this.set('international', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
}
exports.ShippingPrice = ShippingPrice;
//# sourceMappingURL=ShippingPrice.js.map