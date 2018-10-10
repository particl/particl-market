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
const ProposalRepository_1 = require("../repositories/ProposalRepository");
const ProposalCreateRequest_1 = require("../requests/ProposalCreateRequest");
const ProposalUpdateRequest_1 = require("../requests/ProposalUpdateRequest");
const ObjectHash_1 = require("../../core/helpers/ObjectHash");
const HashableObjectType_1 = require("../enums/HashableObjectType");
const ProposalOptionService_1 = require("./ProposalOptionService");
const CoreRpcService_1 = require("./CoreRpcService");
const ProposalResultService_1 = require("./ProposalResultService");
const ProposalOptionResultService_1 = require("./ProposalOptionResultService");
let ProposalService = class ProposalService {
    constructor(proposalOptionService, coreRpcService, proposalResultService, proposalOptionResultService, proposalRepo, Logger) {
        this.proposalOptionService = proposalOptionService;
        this.coreRpcService = coreRpcService;
        this.proposalResultService = proposalResultService;
        this.proposalOptionResultService = proposalOptionResultService;
        this.proposalRepo = proposalRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    searchBy(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.proposalRepo.searchBy(options, withRelated);
            // this.log.debug('searchBy, result: ', JSON.stringify(result.toJSON(), null, 2));
            return result;
        });
    }
    findAll(withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.proposalRepo.findAll(withRelated);
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposal = yield this.proposalRepo.findOne(id, withRelated);
            if (proposal === null) {
                this.log.warn(`Proposal with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return proposal;
        });
    }
    findOneByHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposal = yield this.proposalRepo.findOneByHash(hash, withRelated);
            if (proposal === null) {
                this.log.warn(`Proposal with the hash=${hash} was not found!`);
                throw new NotFoundException_1.NotFoundException(hash);
            }
            return proposal;
        });
    }
    findOneByItemHash(listingItemHash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposal = yield this.proposalRepo.findOneByItemHash(listingItemHash, withRelated);
            if (proposal === null) {
                this.log.warn(`Proposal with the listingItemHash=${listingItemHash} was not found!`);
                throw new NotFoundException_1.NotFoundException(listingItemHash);
            }
            return proposal;
        });
    }
    create(data, skipOptions = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const startTime = new Date().getTime();
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create Proposal, body: ', JSON.stringify(body, null, 2));
            body.hash = ObjectHash_1.ObjectHash.getHash(body, HashableObjectType_1.HashableObjectType.PROPOSAL_CREATEREQUEST);
            // extract and remove related models from request
            const options = body.options || [];
            delete body.options;
            // if the request body was valid we will create the proposal
            const proposal = yield this.proposalRepo.create(body);
            // TODO: remove skipOptions
            // skipOptions is just for tests
            if (!skipOptions) {
                let optionId = 0;
                // create related options
                for (const optionCreateRequest of options) {
                    optionCreateRequest.proposal_id = proposal.id;
                    optionCreateRequest.proposalHash = body.hash;
                    if (!optionCreateRequest.optionId) {
                        optionCreateRequest.optionId = optionId;
                        optionId++;
                    }
                    // this.log.debug('optionCreateRequest: ', JSON.stringify(optionCreateRequest, null, 2));
                    yield this.proposalOptionService.create(optionCreateRequest);
                }
            }
            else {
                this.log.debug('skipping creation of ProposalOptions...');
            }
            // finally find and return the created proposal
            const result = yield this.findOne(proposal.id, true);
            this.log.debug('ProposalService.create: ' + (new Date().getTime() - startTime) + 'ms');
            return result;
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            body.hash = ObjectHash_1.ObjectHash.getHash(body, HashableObjectType_1.HashableObjectType.PROPOSAL_CREATEREQUEST);
            // find the existing one without related
            const proposal = yield this.findOne(id, false);
            // set new values
            proposal.Submitter = body.submitter;
            proposal.BlockStart = body.blockStart;
            proposal.BlockEnd = body.blockEnd;
            proposal.ExpiryTime = body.expiryTime;
            proposal.PostedAt = body.postedAt;
            proposal.ExpiredAt = body.expiredAt;
            proposal.ReceivedAt = body.receivedAt;
            proposal.Hash = body.hash;
            proposal.Item = body.item;
            proposal.Type = body.type;
            proposal.Title = body.title;
            proposal.Description = body.description;
            // update proposal record
            const updatedProposal = yield this.proposalRepo.update(id, proposal.toJSON());
            return updatedProposal;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.proposalRepo.destroy(id);
        });
    }
    /**
     * creates empty ProposalResult for the Proposal
     * todo: create one after call to proposalservice.create, so this doesnt need to be called from anywhere else
     *
     * @param {"resources".Proposal} proposal
     * @returns {Promise<"resources".ProposalResult>}
     */
    createProposalResult(proposal) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currentBlock = yield this.coreRpcService.getBlockCount();
            let proposalResultModel = yield this.proposalResultService.create({
                block: currentBlock,
                proposal_id: proposal.id
            });
            let proposalResult = proposalResultModel.toJSON();
            for (const proposalOption of proposal.ProposalOptions) {
                const proposalOptionResult = yield this.proposalOptionResultService.create({
                    weight: 0,
                    voters: 0,
                    proposal_option_id: proposalOption.id,
                    proposal_result_id: proposalResult.id
                });
                // this.log.debug('processProposalReceivedEvent.proposalOptionResult = ' + JSON.stringify(proposalOptionResult, null, 2));
            }
            proposalResultModel = yield this.proposalResultService.findOne(proposalResult.id);
            proposalResult = proposalResultModel.toJSON();
            // this.log.debug('proposalResult: ', JSON.stringify(proposalResult, null, 2));
            return proposalResult;
        });
    }
    /**
     * todo: needs refactoring, perhaps combine with createProposalResult
     * todo: and move to proposalresultservice?
     * todo: this is just updating the latest one.. we should propably modify this so that we create a new
     * one periodically and can track the voting progress while proposal is active
     *
     * @param {number} proposalResultId
     * @returns {Promise<"resources".ProposalResult>}
     */
    recalculateProposalResult(proposal) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currentBlock = yield this.coreRpcService.getBlockCount();
            // get the proposal
            // const proposalModel = await this.proposalService.findOne(proposalId);
            // const proposal = proposalModel.toJSON();
            this.log.debug('recalculateProposalResult(), proposal.id: ', proposal.id);
            // fetch the latest ProposalResult to get the latest id
            let proposalResultModel = yield this.proposalResultService.findOneByProposalHash(proposal.hash);
            let proposalResult = proposalResultModel.toJSON();
            // first update the block in ProposalResult
            proposalResultModel = yield this.proposalResultService.update(proposalResult.id, {
                block: currentBlock
            });
            proposalResult = proposalResultModel.toJSON();
            // then loop through ProposalOptionResults and update values
            for (const proposalOptionResult of proposalResult.ProposalOptionResults) {
                // get the votes
                const proposalOptionModel = yield this.proposalOptionService.findOne(proposalOptionResult.ProposalOption.id);
                const proposalOption = proposalOptionModel.toJSON();
                // this.log.debug('recalculateProposalResult(), proposalOption: ', JSON.stringify(proposalOption, null, 2));
                this.log.debug('recalculateProposalResult(), proposalOption.Votes.length: ', proposalOption.Votes.length);
                // update
                const updatedProposalOptionResultModel = yield this.proposalOptionResultService.update(proposalOptionResult.id, {
                    weight: proposalOption.Votes.length,
                    voters: proposalOption.Votes.length
                });
                const updatedProposalOptionResult = updatedProposalOptionResultModel.toJSON();
                // this.log.debug('recalculateProposalResult(), proposalOption: ', JSON.stringify(updatedProposalOptionResult, null, 2));
            }
            proposalResultModel = yield this.proposalResultService.findOne(proposalResult.id);
            proposalResult = proposalResultModel.toJSON();
            // this.log.debug('recalculateProposalResult(), proposalResult: ', JSON.stringify(proposalResult, null, 2));
            return proposalResult;
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ProposalCreateRequest_1.ProposalCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ProposalCreateRequest_1.ProposalCreateRequest, Boolean]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ProposalUpdateRequest_1.ProposalUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ProposalUpdateRequest_1.ProposalUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalService.prototype, "update", null);
ProposalService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ProposalOptionService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ProposalResultService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ProposalOptionResultService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Repository.ProposalRepository)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(5, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ProposalOptionService_1.ProposalOptionService,
        CoreRpcService_1.CoreRpcService,
        ProposalResultService_1.ProposalResultService,
        ProposalOptionResultService_1.ProposalOptionResultService,
        ProposalRepository_1.ProposalRepository, Object])
], ProposalService);
exports.ProposalService = ProposalService;
//# sourceMappingURL=ProposalService.js.map