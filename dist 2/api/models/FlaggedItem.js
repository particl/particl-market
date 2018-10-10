"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ListingItem_1 = require("./ListingItem");
const Proposal_1 = require("./Proposal");
class FlaggedItem extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield FlaggedItem.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield FlaggedItem.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'flagged_items'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Reason() { return this.get('reason'); }
    set Reason(value) { this.set('reason', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ListingItem() {
        return this.belongsTo(ListingItem_1.ListingItem, 'listing_item_id', 'id');
    }
    Proposal() {
        return this.belongsTo(Proposal_1.Proposal, 'proposal_id', 'id');
    }
}
FlaggedItem.RELATIONS = [
    'ListingItem',
    'Proposal'
];
exports.FlaggedItem = FlaggedItem;
//# sourceMappingURL=FlaggedItem.js.map