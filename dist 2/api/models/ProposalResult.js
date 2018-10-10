"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Proposal_1 = require("./Proposal");
const ProposalOptionResult_1 = require("./ProposalOptionResult");
const SearchOrder_1 = require("../enums/SearchOrder");
class ProposalResult extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ProposalResult.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ProposalResult.where({ id: value }).fetch();
            }
        });
    }
    static fetchByProposalHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalResultCollection = ProposalResult.forge()
                .query(qb => {
                qb.join('proposals', 'proposal_results.proposal_id', 'proposals.id');
                qb.where('proposals.hash', '=', hash);
            })
                .orderBy('id', SearchOrder_1.SearchOrder.DESC);
            if (withRelated) {
                return yield proposalResultCollection.fetchAll({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield proposalResultCollection.fetchAll();
            }
        });
    }
    get tableName() { return 'proposal_results'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Block() { return this.get('block'); }
    set Block(value) { this.set('block', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Proposal() {
        return this.belongsTo(Proposal_1.Proposal, 'proposal_id', 'id');
    }
    ProposalOptionResults() {
        return this.hasMany(ProposalOptionResult_1.ProposalOptionResult, 'proposal_result_id', 'id');
    }
}
ProposalResult.RELATIONS = [
    'Proposal',
    'ProposalOptionResults',
    'ProposalOptionResults.ProposalOption'
    // 'ProposalOptionResults.ProposalOption.Votes'
];
exports.ProposalResult = ProposalResult;
//# sourceMappingURL=ProposalResult.js.map