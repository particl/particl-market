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
let ProposalOptionRepository = class ProposalOptionRepository {
    constructor(ProposalOptionModel, Logger) {
        this.ProposalOptionModel = ProposalOptionModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ProposalOptionModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ProposalOptionModel.fetchById(id, withRelated);
        });
    }
    findOneByProposalAndOptionId(proposalId, optionId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ProposalOptionModel.fetchByProposalAndOptionId(proposalId, optionId);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalOption = this.ProposalOptionModel.forge(data);
            try {
                const proposalOptionCreated = yield proposalOption.save();
                return this.ProposalOptionModel.fetchById(proposalOptionCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the proposalOption!' + error, error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalOption = this.ProposalOptionModel.forge({ id });
            try {
                const proposalOptionUpdated = yield proposalOption.save(data, { patch: true });
                return this.ProposalOptionModel.fetchById(proposalOptionUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the proposalOption!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let proposalOption = this.ProposalOptionModel.forge({ id });
            try {
                proposalOption = yield proposalOption.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield proposalOption.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the proposalOption!', error);
            }
        });
    }
};
ProposalOptionRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ProposalOption)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ProposalOptionRepository);
exports.ProposalOptionRepository = ProposalOptionRepository;
//# sourceMappingURL=ProposalOptionRepository.js.map