"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
class CurrencyPrice extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield CurrencyPrice.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield CurrencyPrice.where({ id: value }).fetch();
            }
        });
    }
    // find currency price by from currency and to currency
    static search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield CurrencyPrice.where({ from: options.from, to: options.to }).fetch();
        });
    }
    get tableName() { return 'currency_prices'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get From() { return this.get('from'); }
    set From(value) { this.set('from', value); }
    get To() { return this.get('to'); }
    set To(value) { this.set('to', value); }
    get Price() { return this.get('price'); }
    set Price(value) { this.set('price', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
}
exports.CurrencyPrice = CurrencyPrice;
//# sourceMappingURL=CurrencyPrice.js.map