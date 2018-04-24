"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
class EscrowRatio extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield EscrowRatio.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield EscrowRatio.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'escrow_ratios'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Buyer() { return this.get('buyer'); }
    set Buyer(value) { this.set('buyer', value); }
    get Seller() { return this.get('seller'); }
    set Seller(value) { this.set('seller', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
}
exports.EscrowRatio = EscrowRatio;
//# sourceMappingURL=EscrowRatio.js.map