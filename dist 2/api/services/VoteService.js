"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const VoteRepository_1 = require("../repositories/VoteRepository");
const VoteCreateRequest_1 = require("../requests/VoteCreateRequest");
const VoteUpdateRequest_1 = require("../requests/VoteUpdateRequest");
let VoteService = class VoteService {
    constructor(voteRepo, Logger) {
        this.voteRepo = voteRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.voteRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const vote = yield this.voteRepo.findOne(id, withRelated);
            if (vote === null) {
                this.log.warn(`Vote with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return vote;
        });
    }
    findOneByVoterAndProposalId(voter, proposalId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const vote = yield this.voteRepo.findOneByVoterAndProposalId(voter, proposalId, withRelated);
            if (!vote) {
                this.log.warn(`Vote with the voter=${voter} and proposalId=${proposalId} was not found!`);
                throw new NotFoundException_1.NotFoundException(proposalId);
            }
            return vote;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create Vote, body: ', JSON.stringify(body, null, 2));
            const vote = yield this.voteRepo.create(body);
            // finally find and return the created vote
            const newVote = yield this.findOne(vote.id);
            return newVote;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const vote = yield this.findOne(id, false);
            // set new values
            vote.set('voter', body.voter);
            vote.set('block', body.block);
            vote.set('weight', body.weight);
            vote.set('proposalOptionId', body.proposal_option_id);
            // update vote record
            const updatedVote = yield this.voteRepo.update(id, vote.toJSON());
            return updatedVote;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.voteRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(VoteCreateRequest_1.VoteCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [VoteCreateRequest_1.VoteCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], VoteService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(VoteUpdateRequest_1.VoteUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, VoteUpdateRequest_1.VoteUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], VoteService.prototype, "update", null);
VoteService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.VoteRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [VoteRepository_1.VoteRepository, Object])
], VoteService);
exports.VoteService = VoteService;
//# sourceMappingURL=VoteService.js.map