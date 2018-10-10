"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const SearchOrder_1 = require("../enums/SearchOrder");
const ProposalType_1 = require("../enums/ProposalType");
let ProposalRepository = class ProposalRepository {
    constructor(ProposalModel, Logger) {
        this.ProposalModel = ProposalModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     *
     * @param {ListingItemSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<ListingItem>>}
     */
    searchBy(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ProposalModel.searchBy(options, withRelated);
        });
    }
    findAll(withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const searchParams = {
                startBlock: '*',
                endBlock: '*',
                order: SearchOrder_1.SearchOrder.ASC,
                type: ProposalType_1.ProposalType.PUBLIC_VOTE
            };
            return yield this.searchBy(searchParams, withRelated);
        });
    }
    findOneByHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ProposalModel.fetchByHash(hash, withRelated);
        });
    }
    findOneByItemHash(itemHash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ProposalModel.fetchByItemHash(itemHash, withRelated);
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ProposalModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposal = this.ProposalModel.forge(data);
            try {
                const proposalCreated = yield proposal.save();
                return this.ProposalModel.fetchById(proposalCreated.id);
            }
            catch (error) {
                this.log.error('error:', error);
                throw new DatabaseException_1.DatabaseException('Could not create the proposal!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposal = this.ProposalModel.forge({ id });
            try {
                const proposalUpdated = yield proposal.save(data, { patch: true });
                return this.ProposalModel.fetchById(proposalUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the proposal!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let proposal = this.ProposalModel.forge({ id });
            try {
                proposal = yield proposal.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield proposal.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the proposal!', error);
            }
        });
    }
};
ProposalRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.Proposal)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ProposalRepository);
exports.ProposalRepository = ProposalRepository;
//# sourceMappingURL=ProposalRepository.js.map