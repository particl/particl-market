"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ProposalOption_1 = require("./ProposalOption");
class Vote extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Vote.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Vote.where({ id: value }).fetch();
            }
        });
    }
    static fetchByVoterAndProposalId(voter, proposalId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                const vote = Vote.forge()
                    .query(qb => {
                    qb.innerJoin('proposal_options', 'proposal_options.id', 'votes.proposal_option_id');
                    qb.where('proposal_options.proposal_id', '=', proposalId);
                    qb.andWhere('voter', '=', voter);
                });
                return yield vote.fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                const vote = Vote.forge()
                    .query(qb => {
                    qb.innerJoin('proposal_options', 'proposal_options.id', 'votes.proposal_option_id');
                    qb.where('proposal_options.proposal_id', '=', proposalId);
                    qb.andWhere('voter', '=', voter);
                });
                return yield vote.fetch();
            }
        });
    }
    get tableName() { return 'votes'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Voter() { return this.get('voter'); }
    set Voter(value) { this.set('voter', value); }
    get Block() { return this.get('block'); }
    set Block(value) { this.set('block', value); }
    get Weight() { return this.get('weight'); }
    set Weight(value) { this.set('weight', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ProposalOption() {
        return this.belongsTo(ProposalOption_1.ProposalOption, 'proposal_option_id', 'id');
    }
}
Vote.RELATIONS = [
    'ProposalOption',
    'ProposalOption.Proposal',
    'ProposalOption.Proposal.FlaggedItem',
    'ProposalOption.Proposal.FlaggedItem.ListingItem'
];
exports.Vote = Vote;
//# sourceMappingURL=Vote.js.map