"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ProposalResult_1 = require("./ProposalResult");
const ProposalOption_1 = require("./ProposalOption");
class ProposalOptionResult extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ProposalOptionResult.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ProposalOptionResult.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'proposal_option_results'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Weight() { return this.get('weight'); }
    set Weight(value) { this.set('weight', value); }
    get Voters() { return this.get('voters'); }
    set Voters(value) { this.set('voters', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ProposalResult() {
        return this.belongsTo(ProposalResult_1.ProposalResult, 'proposal_result_id', 'id');
    }
    ProposalOption() {
        return this.belongsTo(ProposalOption_1.ProposalOption, 'proposal_option_id', 'id');
    }
}
ProposalOptionResult.RELATIONS = [
    'ProposalOption',
    'ProposalResult',
    'ProposalResult.Proposal'
];
exports.ProposalOptionResult = ProposalOptionResult;
//# sourceMappingURL=ProposalOptionResult.js.map