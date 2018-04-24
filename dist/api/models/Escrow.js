"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const EscrowRatio_1 = require("./EscrowRatio");
class Escrow extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Escrow.where({ id: value }).fetch({
                    withRelated: [
                        'Ratio'
                    ]
                });
            }
            else {
                return yield Escrow.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'escrows'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Type() { return this.get('type'); }
    set Type(value) { this.set('type', value); }
    get PaymentInformationId() { return this.get('payment_information_id'); }
    set PaymentInformationId(value) { this.set('payment_information_id', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Ratio() {
        return this.hasOne(EscrowRatio_1.EscrowRatio);
    }
}
exports.Escrow = Escrow;
//# sourceMappingURL=Escrow.js.map