"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Profile_1 = require("./Profile");
class Address extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Address.where({ id: value }).fetch({
                    withRelated: [
                        'Profile'
                    ]
                });
            }
            else {
                return yield Address.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'addresses'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get FirstName() { return this.get('first_name'); }
    set FirstName(value) { this.set('first_name', value); }
    get LastName() { return this.get('last_name'); }
    set LastName(value) { this.set('last_name', value); }
    get Title() { return this.get('title'); }
    set Title(value) { this.set('title', value); }
    get AddressLine1() { return this.get('address_line1'); }
    set AddressLine1(value) { this.set('address_line1', value); }
    get AddressLine2() { return this.get('address_line2'); }
    set AddressLine2(value) { this.set('address_line2', value); }
    get City() { return this.get('city'); }
    set City(value) { this.set('city', value); }
    get State() { return this.get('state'); }
    set State(value) { this.set('state', value); }
    get Country() { return this.get('country'); }
    set Country(value) { this.set('country', value); }
    get ZipCode() { return this.get('zip_code'); }
    set ZipCode(value) { this.set('zip_code', value); }
    get Type() { return this.get('type'); }
    set Type(value) { this.set('type', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Profile() {
        return this.belongsTo(Profile_1.Profile, 'profile_id', 'id');
    }
}
exports.Address = Address;
//# sourceMappingURL=Address.js.map