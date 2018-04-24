"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
class Market extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Market.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield Market.where({ id: value }).fetch();
            }
        });
    }
    static fetchByAddress(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Market.where({ address: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield Market.where({ address: value }).fetch();
            }
        });
    }
    static fetchByName(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Market.where({ name: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield Market.where({ name: value }).fetch();
            }
        });
    }
    get tableName() { return 'markets'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Name() { return this.get('name'); }
    set Name(value) { this.set('name', value); }
    get PrivateKey() { return this.get('private_key'); }
    set PrivateKey(value) { this.set('private_key', value); }
    get Address() { return this.get('address'); }
    set Address(value) { this.set('address', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
}
exports.Market = Market;
//# sourceMappingURL=Market.js.map