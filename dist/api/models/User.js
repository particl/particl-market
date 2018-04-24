"use strict";
/**
 * User Model
 * ------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const constants_1 = require("../../constants");
class User extends Database_1.Bookshelf.Model {
    static fetchById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return User.where({ id }).fetch();
        });
    }
    static fetchByUserId(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return User.where({ auth_0_user_id: userId }).fetch();
        });
    }
    /**
     * Configurations
     */
    get tableName() { return constants_1.Tables.Users; }
    get hasTimestamps() { return true; }
    /**
     * Properties
     */
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get FirstName() { return this.get('firstName'); }
    set FirstName(value) { this.set('firstName', value); }
    get LastName() { return this.get('lastName'); }
    set LastName(value) { this.set('lastName', value); }
    get Email() { return this.get('email'); }
    set Email(value) { this.set('email', value); }
    get Picture() { return this.get('picture'); }
    set Picture(value) { this.set('picture', value); }
    get Auth0UserId() { return this.get('auth0UserId'); }
    set Auth0UserId(value) { this.set('auth0UserId', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    /**
     * Helper methods
     */
    fullName() {
        return this.FirstName + ' ' + this.LastName;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map