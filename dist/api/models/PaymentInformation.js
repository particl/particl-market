"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Escrow_1 = require("./Escrow");
const ItemPrice_1 = require("./ItemPrice");
class PaymentInformation extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield PaymentInformation.where({ id: value }).fetch({
                    withRelated: [
                        'Escrow',
                        'Escrow.Ratio',
                        'ItemPrice',
                        'ItemPrice.ShippingPrice',
                        'ItemPrice.CryptocurrencyAddress'
                    ]
                });
            }
            else {
                return yield PaymentInformation.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'payment_informations'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Type() { return this.get('type'); }
    set Type(value) { this.set('type', value); }
    // public get ListingItemTemplateId(): number { return this.get('listing_item_template_id'); }
    // public set ListingItemTemplateId(value: number) { this.set('listing_item_template_id', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Escrow() {
        return this.hasOne(Escrow_1.Escrow);
    }
    ItemPrice() {
        return this.hasOne(ItemPrice_1.ItemPrice);
    }
}
exports.PaymentInformation = PaymentInformation;
//# sourceMappingURL=PaymentInformation.js.map