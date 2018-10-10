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
let ProposalOptionResultRepository = class ProposalOptionResultRepository {
    constructor(ProposalOptionResultModel, Logger) {
        this.ProposalOptionResultModel = ProposalOptionResultModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ProposalOptionResultModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ProposalOptionResultModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalOptionResult = this.ProposalOptionResultModel.forge(data);
            try {
                const proposalOptionResultCreated = yield proposalOptionResult.save();
                return this.ProposalOptionResultModel.fetchById(proposalOptionResultCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the proposalOptionResult! ' + error, error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalOptionResult = this.ProposalOptionResultModel.forge({ id });
            try {
                const proposalOptionResultUpdated = yield proposalOptionResult.save(data, { patch: true });
                return this.ProposalOptionResultModel.fetchById(proposalOptionResultUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the proposalOptionResult!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let proposalOptionResult = this.ProposalOptionResultModel.forge({ id });
            try {
                proposalOptionResult = yield proposalOptionResult.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield proposalOptionResult.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the proposalOptionResult!', error);
            }
        });
    }
};
ProposalOptionResultRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ProposalOptionResult)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ProposalOptionResultRepository);
exports.ProposalOptionResultRepository = ProposalOptionResultRepository;
//# sourceMappingURL=ProposalOptionResultRepository.js.map