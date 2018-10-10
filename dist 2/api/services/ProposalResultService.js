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
const ProposalResultRepository_1 = require("../repositories/ProposalResultRepository");
const ProposalResultCreateRequest_1 = require("../requests/ProposalResultCreateRequest");
const ProposalResultUpdateRequest_1 = require("../requests/ProposalResultUpdateRequest");
// import { ProposalService } from '../services/ProposalService';
let ProposalResultService = class ProposalResultService {
    constructor(
        // @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        proposalResultRepo, Logger) {
        this.proposalResultRepo = proposalResultRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.proposalResultRepo.findAll();
        });
    }
    findAllByProposalHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.proposalResultRepo.findAllByProposalHash(hash, withRelated);
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalResult = yield this.proposalResultRepo.findOne(id, withRelated);
            if (proposalResult === null) {
                this.log.warn(`ProposalResult with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return proposalResult;
        });
    }
    findOneByProposalHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalResult = yield this.proposalResultRepo.findAllByProposalHash(hash, withRelated);
            // this.log.debug('proposalResult:', JSON.stringify(proposalResult, null, 2));
            if (proposalResult === null) {
                this.log.warn(`ProposalResult with the hash=${hash} was not found!`);
                throw new NotFoundException_1.NotFoundException(hash);
            }
            return proposalResult.first();
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create ProposalResult, body: ', JSON.stringify(body, null, 2));
            // TODO: extract and remove related models from request
            // const proposalResultRelated = body.related;
            // delete body.related;
            // If the request body was valid we will create the proposalResult
            const proposalResult = yield this.proposalResultRepo.create(body);
            // TODO: create related models
            // proposalResultRelated._id = proposalResult.Id;
            // await this.proposalResultRelatedService.create(proposalResultRelated);
            // finally find and return the created proposalResult
            const newProposalResult = yield this.findOne(proposalResult.id);
            return newProposalResult;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const proposalResult = yield this.findOne(id, false);
            // proposalResult = proposalResult.toJSON();
            // set new values
            proposalResult.Block = body.block;
            // update proposalResult record
            const updatedProposalResult = yield this.proposalResultRepo.update(id, proposalResult.toJSON());
            // const newProposalResult = await this.findOne(id);
            // return newProposalResult;
            return updatedProposalResult;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.proposalResultRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ProposalResultCreateRequest_1.ProposalResultCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ProposalResultCreateRequest_1.ProposalResultCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalResultService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ProposalResultUpdateRequest_1.ProposalResultUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ProposalResultUpdateRequest_1.ProposalResultUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalResultService.prototype, "update", null);
ProposalResultService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ProposalResultRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ProposalResultRepository_1.ProposalResultRepository, Object])
], ProposalResultService);
exports.ProposalResultService = ProposalResultService;
//# sourceMappingURL=ProposalResultService.js.map