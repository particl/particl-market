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
let VoteRepository = class VoteRepository {
    constructor(VoteModel, Logger) {
        this.VoteModel = VoteModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.VoteModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.VoteModel.fetchById(id, withRelated);
        });
    }
    findOneByVoterAndProposalId(voter, proposalId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.VoteModel.fetchByVoterAndProposalId(voter, proposalId, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const vote = this.VoteModel.forge(data);
            try {
                const voteCreated = yield vote.save();
                return this.VoteModel.fetchById(voteCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the vote! ' + error, error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const vote = this.VoteModel.forge({ id });
            try {
                const voteUpdated = yield vote.save(data, { patch: true });
                return this.VoteModel.fetchById(voteUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the vote! ' + error, error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let vote = this.VoteModel.forge({ id });
            try {
                vote = yield vote.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield vote.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the vote! ' + error, error);
            }
        });
    }
};
VoteRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.Vote)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], VoteRepository);
exports.VoteRepository = VoteRepository;
//# sourceMappingURL=VoteRepository.js.map