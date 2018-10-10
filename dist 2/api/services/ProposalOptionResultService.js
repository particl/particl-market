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
const ProposalOptionResultRepository_1 = require("../repositories/ProposalOptionResultRepository");
const ProposalOptionResultCreateRequest_1 = require("../requests/ProposalOptionResultCreateRequest");
const ProposalOptionResultUpdateRequest_1 = require("../requests/ProposalOptionResultUpdateRequest");
let ProposalOptionResultService = class ProposalOptionResultService {
    constructor(proposalOptionResultRepo, Logger) {
        this.proposalOptionResultRepo = proposalOptionResultRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.proposalOptionResultRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalOptionResult = yield this.proposalOptionResultRepo.findOne(id, withRelated);
            if (proposalOptionResult === null) {
                this.log.warn(`ProposalOptionResult with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return proposalOptionResult;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create ProposalOptionResult, body: ', JSON.stringify(body, null, 2));
            // TODO: extract and remove related models from request
            // const proposalOptionResultRelated = body.related;
            // delete body.related;
            // If the request body was valid we will create the proposalOptionResult
            const proposalOptionResult = yield this.proposalOptionResultRepo.create(body);
            // TODO: create related models
            // proposalOptionResultRelated._id = proposalOptionResult.Id;
            // await this.proposalOptionResultRelatedService.create(proposalOptionResultRelated);
            // finally find and return the created proposalOptionResult
            const newProposalOptionResult = yield this.findOne(proposalOptionResult.id);
            return newProposalOptionResult;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const proposalOptionResult = yield this.findOne(id, false);
            // set new values
            // proposalOptionResult.ProposalResultId = body.proposalResultId;
            // proposalOptionResult.ProposalOptionId = body.proposalOptionId;
            proposalOptionResult.Weight = body.weight;
            proposalOptionResult.Voters = body.voters;
            // update proposalOptionResult record
            const updatedProposalOptionResult = yield this.proposalOptionResultRepo.update(id, proposalOptionResult.toJSON());
            // const newProposalOptionResult = await this.findOne(id);
            // return newProposalOptionResult;
            return updatedProposalOptionResult;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.proposalOptionResultRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ProposalOptionResultCreateRequest_1.ProposalOptionResultCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ProposalOptionResultCreateRequest_1.ProposalOptionResultCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalOptionResultService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ProposalOptionResultUpdateRequest_1.ProposalOptionResultUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ProposalOptionResultUpdateRequest_1.ProposalOptionResultUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalOptionResultService.prototype, "update", null);
ProposalOptionResultService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ProposalOptionResultRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ProposalOptionResultRepository_1.ProposalOptionResultRepository, Object])
], ProposalOptionResultService);
exports.ProposalOptionResultService = ProposalOptionResultService;
//# sourceMappingURL=ProposalOptionResultService.js.map