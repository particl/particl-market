"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Address_1 = require("./Address");
const FavoriteItem_1 = require("./FavoriteItem");
const CryptocurrencyAddress_1 = require("./CryptocurrencyAddress");
const ShoppingCart_1 = require("./ShoppingCart");
class Profile extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Profile.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Profile.where({ id: value }).fetch();
            }
        });
    }
    static fetchByName(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Profile.where({ name: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Profile.where({ name: value }).fetch();
            }
        });
    }
    static fetchByAddress(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Profile.where({ address: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Profile.where({ address: value }).fetch();
            }
        });
    }
    get tableName() { return 'profiles'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Name() { return this.get('name'); }
    set Name(value) { this.set('name', value); }
    get Address() { return this.get('address'); }
    set Address(value) { this.set('address', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ShippingAddresses() {
        return this.hasMany(Address_1.Address, 'profile_id', 'id');
    }
    CryptocurrencyAddresses() {
        return this.hasMany(CryptocurrencyAddress_1.CryptocurrencyAddress, 'profile_id', 'id');
    }
    FavoriteItems() {
        return this.hasMany(FavoriteItem_1.FavoriteItem, 'profile_id', 'id');
    }
    ShoppingCart() {
        return this.hasMany(ShoppingCart_1.ShoppingCart, 'profile_id', 'id');
    }
}
Profile.RELATIONS = [
    'ShippingAddresses',
    'CryptocurrencyAddresses',
    'FavoriteItems',
    'ShoppingCart'
];
exports.Profile = Profile;
//# sourceMappingURL=Profile.js.map