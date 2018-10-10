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
let ProposalResultRepository = class ProposalResultRepository {
    constructor(ProposalResultModel, Logger) {
        this.ProposalResultModel = ProposalResultModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ProposalResultModel.fetchAll();
            return list;
        });
    }
    // we can have multiple of these in the future
    findAllByProposalHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.ProposalResultModel.fetchByProposalHash(hash, withRelated);
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.ProposalResultModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalResult = this.ProposalResultModel.forge(data);
            try {
                const proposalResultCreated = yield proposalResult.save();
                return yield this.ProposalResultModel.fetchById(proposalResultCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the proposalResult!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalResult = this.ProposalResultModel.forge({ id });
            try {
                const proposalResultUpdated = yield proposalResult.save(data, { patch: true });
                return yield this.ProposalResultModel.fetchById(proposalResultUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the proposalResult!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let proposalResult = this.ProposalResultModel.forge({ id });
            try {
                proposalResult = yield proposalResult.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield proposalResult.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the proposalResult!', error);
            }
        });
    }
};
ProposalResultRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ProposalResult)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ProposalResultRepository);
exports.ProposalResultRepository = ProposalResultRepository;
//# sourceMappingURL=ProposalResultRepository.js.map