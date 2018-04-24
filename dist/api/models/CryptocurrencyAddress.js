"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Profile_1 = require("./Profile");
class CryptocurrencyAddress extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield CryptocurrencyAddress.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield CryptocurrencyAddress.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'cryptocurrency_addresses'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Type() { return this.get('type'); }
    set Type(value) { this.set('type', value); }
    get Address() { return this.get('address'); }
    set Address(value) { this.set('address', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Profile() {
        return this.belongsTo(Profile_1.Profile, 'profile_id', 'id');
    }
}
exports.CryptocurrencyAddress = CryptocurrencyAddress;
//# sourceMappingURL=CryptocurrencyAddress.js.map