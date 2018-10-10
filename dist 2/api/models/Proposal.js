"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ProposalOption_1 = require("./ProposalOption");
const ProposalResult_1 = require("./ProposalResult");
const FlaggedItem_1 = require("./FlaggedItem");
class Proposal extends Database_1.Bookshelf.Model {
    /**
     * list * 100 -> return all proposals which ended before block 100
     * list 100 * -> return all proposals ending after block 100
     * list 100 200 -> return all which are active and closed between 100 200
     *
     * @param {ProposalSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<Proposal>>}
     */
    static searchBy(options, withRelated = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalCollection = Proposal.forge()
                .query(qb => {
                if (options.type) {
                    // search all
                    qb.where('proposals.type', '=', options.type.toString());
                }
                if (typeof options.startBlock === 'number' && typeof options.endBlock === 'string') {
                    // search all ending after options.startBlock
                    qb.where('proposals.block_end', '>', options.startBlock - 1);
                }
                else if (typeof options.startBlock === 'string' && typeof options.endBlock === 'number') {
                    // search all ending before block
                    qb.where('proposals.block_end', '<', options.endBlock + 1);
                }
                else if (typeof options.startBlock === 'number' && typeof options.endBlock === 'number') {
                    // search all ending after startBlock, starting before endBlock
                    qb.where('proposals.block_start', '<', options.endBlock + 1);
                    qb.andWhere('proposals.block_end', '>', options.startBlock - 1);
                }
            })
                .orderBy('block_start', options.order);
            if (withRelated) {
                return yield proposalCollection.fetchAll({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield proposalCollection.fetchAll();
            }
        });
    }
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Proposal.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Proposal.where({ id: value }).fetch();
            }
        });
    }
    static fetchByHash(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Proposal.where({ hash: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Proposal.where({ hash: value }).fetch();
            }
        });
    }
    static fetchByItemHash(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Proposal.where({ item: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Proposal.where({ item: value }).fetch();
            }
        });
    }
    get tableName() { return 'proposals'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Submitter() { return this.get('submitter'); }
    set Submitter(value) { this.set('submitter', value); }
    get BlockStart() { return this.get('blockStart'); }
    set BlockStart(value) { this.set('blockStart', value); }
    get BlockEnd() { return this.get('blockEnd'); }
    set BlockEnd(value) { this.set('blockEnd', value); }
    get Hash() { return this.get('hash'); }
    set Hash(value) { this.set('hash', value); }
    get Item() { return this.get('item'); }
    set Item(value) { this.set('item', value); }
    get Type() { return this.get('type'); }
    set Type(value) { this.set('type', value); }
    get Title() { return this.get('title'); }
    set Title(value) { this.set('title', value); }
    get Description() { return this.get('description'); }
    set Description(value) { this.set('description', value); }
    get ExpiryTime() { return this.get('expiryTime'); }
    set ExpiryTime(value) { this.set('expiryTime', value); }
    get PostedAt() { return this.get('postedAt'); }
    set PostedAt(value) { this.set('postedAt', value); }
    get ExpiredAt() { return this.get('expiredAt'); }
    set ExpiredAt(value) { this.set('expiredAt', value); }
    get ReceivedAt() { return this.get('receivedAt'); }
    set ReceivedAt(value) { this.set('receivedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    ProposalOptions() {
        return this.hasMany(ProposalOption_1.ProposalOption, 'proposal_id', 'id');
    }
    ProposalResults() {
        return this.hasMany(ProposalResult_1.ProposalResult, 'proposal_id', 'id');
    }
    FlaggedItem() {
        return this.hasOne(FlaggedItem_1.FlaggedItem);
    }
}
Proposal.RELATIONS = [
    'ProposalOptions',
    // 'ProposalOptions.Votes',
    'ProposalResults',
    'ProposalResults.ProposalOptionResults',
    'ProposalResults.ProposalOptionResults.ProposalOption',
    'FlaggedItem'
];
exports.Proposal = Proposal;
//# sourceMappingURL=Proposal.js.map