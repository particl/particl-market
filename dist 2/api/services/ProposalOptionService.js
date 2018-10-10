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
const ProposalOptionRepository_1 = require("../repositories/ProposalOptionRepository");
const ProposalOptionCreateRequest_1 = require("../requests/ProposalOptionCreateRequest");
const ProposalOptionUpdateRequest_1 = require("../requests/ProposalOptionUpdateRequest");
const ObjectHash_1 = require("../../core/helpers/ObjectHash");
const HashableObjectType_1 = require("../enums/HashableObjectType");
const NotImplementedException_1 = require("../exceptions/NotImplementedException");
let ProposalOptionService = class ProposalOptionService {
    constructor(proposalOptionRepo, Logger) {
        this.proposalOptionRepo = proposalOptionRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.proposalOptionRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalOption = yield this.proposalOptionRepo.findOne(id, withRelated);
            if (proposalOption === null) {
                this.log.warn(`ProposalOption with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return proposalOption;
        });
    }
    findOneByProposalAndOptionId(proposalId, optionId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalOption = yield this.proposalOptionRepo.findOneByProposalAndOptionId(proposalId, optionId, withRelated);
            if (proposalOption === null) {
                this.log.warn(`ProposalOption with the proposalId=${proposalId} and optionId=${optionId} was not found!`);
                throw new NotFoundException_1.NotFoundException(proposalId);
            }
            return proposalOption;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const startTime = new Date().getTime();
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create ProposalOption, body: ', JSON.stringify(body, null, 2));
            body.hash = ObjectHash_1.ObjectHash.getHash(body, HashableObjectType_1.HashableObjectType.PROPOSALOPTION_CREATEREQUEST);
            delete body.proposalHash;
            // If the request body was valid we will create the proposalOption
            const proposalOption = yield this.proposalOptionRepo.create(body);
            // finally find and return the created proposal
            const result = yield this.findOne(proposalOption.id, true);
            // this.log.debug('ProposalOption.create, result:', JSON.stringify(result, null, 2));
            this.log.debug('ProposalOptionService.create: ' + (new Date().getTime() - startTime) + 'ms');
            return result;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // update not needed
            throw new NotImplementedException_1.NotImplementedException();
            /*
                    // find the existing one without related
                    const proposalOption = await this.findOne(id, false);
            
                    // set new values
                    proposalOption.OptionId = body.optionId;
                    proposalOption.Description = body.description;
                    proposalOption.Hash = body.hash;
            
                    // update proposalOption record
                    const updatedProposalOption = await this.proposalOptionRepo.update(id, proposalOption.toJSON());
            
                    // TODO: update the Proposal.hash
                    // const newProposalOption = await this.findOne(id);
                    // return newProposalOption;
            
                    return updatedProposalOption;
            */
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.proposalOptionRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ProposalOptionCreateRequest_1.ProposalOptionCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ProposalOptionCreateRequest_1.ProposalOptionCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalOptionService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ProposalOptionUpdateRequest_1.ProposalOptionUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ProposalOptionUpdateRequest_1.ProposalOptionUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalOptionService.prototype, "update", null);
ProposalOptionService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ProposalOptionRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ProposalOptionRepository_1.ProposalOptionRepository, Object])
], ProposalOptionService);
exports.ProposalOptionService = ProposalOptionService;
//# sourceMappingURL=ProposalOptionService.js.map