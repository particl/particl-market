"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const CryptocurrencyAddress_1 = require("./CryptocurrencyAddress");
const ShippingPrice_1 = require("./ShippingPrice");
class ItemPrice extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ItemPrice.where({ id: value }).fetch({
                    withRelated: [
                        'ShippingPrice',
                        'CryptocurrencyAddress'
                    ]
                });
            }
            else {
                return yield ItemPrice.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'item_prices'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Currency() { return this.get('currency'); }
    set Currency(value) { this.set('currency', value); }
    get BasePrice() { return this.get('basePrice'); }
    set BasePrice(value) { this.set('basePrice', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ShippingPrice() {
        return this.hasOne(ShippingPrice_1.ShippingPrice);
    }
    CryptocurrencyAddress() {
        return this.belongsTo(CryptocurrencyAddress_1.CryptocurrencyAddress, 'cryptocurrency_address_id', 'id');
    }
}
exports.ItemPrice = ItemPrice;
//# sourceMappingURL=ItemPrice.js.map