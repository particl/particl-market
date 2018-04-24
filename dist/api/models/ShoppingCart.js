"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Profile_1 = require("./Profile");
const ShoppingCartItem_1 = require("./ShoppingCartItem");
class ShoppingCart extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ShoppingCart.where({ id: value }).fetch({
                    withRelated: [
                        'Profile',
                        'ShoppingCartItem'
                    ]
                });
            }
            else {
                return yield ShoppingCart.where({ id: value }).fetch();
            }
        });
    }
    static fetchAllByProfile(value) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shoppingCart = ShoppingCart.forge()
                .query(qb => {
                qb.where('profile_id', '=', value);
            }).orderBy('id', 'ASC');
            return yield shoppingCart.fetchAll();
        });
    }
    get tableName() { return 'shopping_cart'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Name() { return this.get('name'); }
    set Name(value) { this.set('name', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Profile() {
        return this.belongsTo(Profile_1.Profile, 'profile_id', 'id');
    }
    ShoppingCartItem() {
        return this.hasMany(ShoppingCartItem_1.ShoppingCartItem, 'shopping_cart_id', 'id');
    }
}
exports.ShoppingCart = ShoppingCart;
//# sourceMappingURL=ShoppingCart.js.map