"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const ProposalOptionService_1 = require("../services/ProposalOptionService");
let VoteFactory = class VoteFactory {
    constructor(proposalOptionService, Logger) {
        this.proposalOptionService = proposalOptionService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     *
     * @param {VoteMessageType} voteMessageType
     * @param {string} itemHash
     * @param {IdValuePair[]} idValuePairObjects
     * @returns {Promise<VoteMessage>}
     */
    getMessage(voteMessageType, proposal, proposalOption, senderProfile, currentBlock) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalHash = proposal.hash;
            const optionId = proposalOption.optionId;
            const voter = senderProfile.address;
            const block = currentBlock;
            const weight = 1;
            return {
                action: voteMessageType,
                proposalHash,
                optionId,
                voter,
                block,
                weight
            };
        });
    }
    /**
     *
     * @param {VoteMessage} voteMessage
     * @param {"resources".Proposal} proposal
     * @param {number} block
     * @param {number} weight
     * @param {boolean} create
     * @returns {Promise<VoteCreateRequest | VoteUpdateRequest>}
     */
    getModel(voteMessage, proposal, block, weight, create) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const voteRequest = {
                voter: voteMessage.voter,
                block,
                weight
            };
            // TODO: remove the service from here
            const option = yield this.proposalOptionService.findOneByProposalAndOptionId(proposal.id, voteMessage.optionId);
            voteRequest.proposal_option_id = option.id;
            return voteRequest;
        });
    }
};
VoteFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ProposalOptionService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ProposalOptionService_1.ProposalOptionService, Object])
], VoteFactory);
exports.VoteFactory = VoteFactory;
//# sourceMappingURL=VoteFactory.js.map