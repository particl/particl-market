"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
class MessagingInformation extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield MessagingInformation.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield MessagingInformation.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'messaging_informations'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Protocol() { return this.get('protocol'); }
    set Protocol(value) { this.set('protocol', value); }
    get PublicKey() { return this.get('publicKey'); }
    set PublicKey(value) { this.set('publicKey', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
}
exports.MessagingInformation = MessagingInformation;
//# sourceMappingURL=MessagingInformation.js.map