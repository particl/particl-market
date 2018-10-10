"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Proposal_1 = require("./Proposal");
const Vote_1 = require("./Vote");
class ProposalOption extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ProposalOption.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ProposalOption.where({ id: value }).fetch();
            }
        });
    }
    static fetchByProposalAndOptionId(proposalId, optionId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ProposalOption.where({ proposal_id: proposalId, option_id: optionId }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ProposalOption.where({ proposal_id: proposalId, option_id: optionId }).fetch();
            }
        });
    }
    get tableName() { return 'proposal_options'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get OptionId() { return this.get('option_id'); }
    set OptionId(value) { this.set('option_id', value); }
    get Description() { return this.get('description'); }
    set Description(value) { this.set('description', value); }
    get Hash() { return this.get('hash'); }
    set Hash(value) { this.set('hash', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Proposal() {
        return this.belongsTo(Proposal_1.Proposal, 'proposal_id', 'id');
    }
    Votes() {
        return this.hasMany(Vote_1.Vote, 'proposal_option_id', 'id');
    }
}
ProposalOption.RELATIONS = [
    'Proposal',
    'Votes'
];
exports.ProposalOption = ProposalOption;
//# sourceMappingURL=ProposalOption.js.map