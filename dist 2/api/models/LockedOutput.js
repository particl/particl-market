"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Bid_1 = require("./Bid");
class LockedOutput extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield LockedOutput.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield LockedOutput.where({ id: value }).fetch();
            }
        });
    }
    static fetchByTxId(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield LockedOutput.where({ txid: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield LockedOutput.where({ txid: value }).fetch();
            }
        });
    }
    get tableName() { return 'locked_outputs'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Txid() { return this.get('txid'); }
    set Txid(value) { this.set('txid', value); }
    get Vout() { return this.get('vout'); }
    set Vout(value) { this.set('vout', value); }
    get Amount() { return this.get('amount'); }
    set Amount(value) { this.set('amount', value); }
    get Data() { return this.get('data'); }
    set Data(value) { this.set('data', value); }
    get Address() { return this.get('address'); }
    set Address(value) { this.set('address', value); }
    get ScriptPubKey() { return this.get('scriptPubKey'); }
    set ScriptPubKey(value) { this.set('scriptPubKey', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Bid() {
        return this.belongsTo(Bid_1.Bid, 'bid_id', 'id');
    }
}
LockedOutput.RELATIONS = [
    'Bid'
];
exports.LockedOutput = LockedOutput;
//# sourceMappingURL=LockedOutput.js.map