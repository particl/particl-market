"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const SmsgService_1 = require("./SmsgService");
const events_1 = require("events");
const ProposalMessageType_1 = require("../enums/ProposalMessageType");
const ProposalFactory_1 = require("../factories/ProposalFactory");
const ProposalService_1 = require("./ProposalService");
const ProposalResultService_1 = require("./ProposalResultService");
const ProposalOptionResultService_1 = require("./ProposalOptionResultService");
const CoreRpcService_1 = require("./CoreRpcService");
const MessageException_1 = require("../exceptions/MessageException");
const ProposalType_1 = require("../enums/ProposalType");
const ListingItemService_1 = require("./ListingItemService");
const VoteFactory_1 = require("../factories/VoteFactory");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
const SmsgMessageService_1 = require("./SmsgMessageService");
const VoteService_1 = require("./VoteService");
const ItemVote_1 = require("../enums/ItemVote");
const FlaggedItemService_1 = require("./FlaggedItemService");
let ProposalActionService = class ProposalActionService {
    constructor(proposalFactory, coreRpcService, smsgService, listingItemService, proposalService, proposalResultService, proposalOptionResultService, smsgMessageService, voteFactory, voteService, flaggedItemService, eventEmitter, Logger) {
        this.proposalFactory = proposalFactory;
        this.coreRpcService = coreRpcService;
        this.smsgService = smsgService;
        this.listingItemService = listingItemService;
        this.proposalService = proposalService;
        this.proposalResultService = proposalResultService;
        this.proposalOptionResultService = proposalOptionResultService;
        this.smsgMessageService = smsgMessageService;
        this.voteFactory = voteFactory;
        this.voteService = voteService;
        this.flaggedItemService = flaggedItemService;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }
    /**
     * create ProposalMessage (of type MP_PROPOSAL_ADD) and post it
     *
     * @param {ProposalType} proposalType
     * @param {string} proposalTitle
     * @param {string} proposalDescription
     * @param {number} blockStart
     * @param {number} blockEnd
     * @param {number} daysRetention
     * @param {string[]} options
     * @param {"resources".Profile} senderProfile
     * @param {"resources".Market} marketplace
     * @param {string} itemHash
     * @param {boolean} estimateFee
     * @returns {Promise<SmsgSendResponse>}
     */
    send(proposalTitle, proposalDescription, blockStart, blockEnd, daysRetention, options, senderProfile, marketplace, itemHash = null, estimateFee = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalMessage = yield this.proposalFactory.getMessage(ProposalMessageType_1.ProposalMessageType.MP_PROPOSAL_ADD, proposalTitle, proposalDescription, blockStart, blockEnd, options, senderProfile, itemHash);
            const msg = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: proposalMessage
            };
            const paidMessage = proposalMessage.type === ProposalType_1.ProposalType.PUBLIC_VOTE;
            return this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, paidMessage, daysRetention, estimateFee);
        });
    }
    /**
     * process received ProposalMessage:
     *
     *  if item_vote
     *      if proposal exists
     *          update to use the one that was sent first
     *      else
     *          create Proposal
     *      add vote
     *      if listingitem exists && no relation
     *          add relation to listingitem
     *  else (ProposalType.PUBLIC_VOTE)
     *      create Proposal
     *  create ProposalResult
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    processProposalReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const smsgMessage = event.smsgMessage;
            const marketplaceMessage = event.marketplaceMessage;
            const proposalMessage = marketplaceMessage.mpaction;
            const proposalCreateRequest = yield this.proposalFactory.getModel(proposalMessage, smsgMessage);
            let proposal;
            let vote;
            if (proposalCreateRequest.type === ProposalType_1.ProposalType.ITEM_VOTE) {
                proposal = yield this.proposalService.findOneByItemHash(proposalCreateRequest.item)
                    .then((existingProposalModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // proposal exists
                    const existingProposal = existingProposalModel.toJSON();
                    if (proposalCreateRequest.postedAt < existingProposal.postedAt) {
                        // incoming was posted before the existing -> update existing with incoming data
                        const updatedProposalModel = yield this.proposalService.update(existingProposal.id, proposalCreateRequest);
                        return updatedProposalModel.toJSON();
                    }
                    else {
                        return existingProposal;
                    }
                }))
                    .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    // proposal doesnt exist -> create Proposal
                    const createdProposalModel = yield this.proposalService.create(proposalCreateRequest);
                    return createdProposalModel.toJSON();
                }));
                // this.log.debug('proposal:', JSON.stringify(proposal, null, 2));
                // finally, create ProposalResult, vote and recalculate proposalresult
                let proposalResult = yield this.proposalService.createProposalResult(proposal);
                vote = yield this.createVote(proposal, ItemVote_1.ItemVote.REMOVE);
                const flaggedItem = yield this.createFlaggedItemForProposal(proposal);
                proposalResult = yield this.proposalService.recalculateProposalResult(proposal);
                this.log.debug('vote:', JSON.stringify(vote, null, 2));
                this.log.debug('flaggedItem:', JSON.stringify(flaggedItem, null, 2));
            }
            else {
                const createdProposalModel = yield this.proposalService.create(proposalCreateRequest);
                proposal = createdProposalModel.toJSON();
                // finally, create ProposalResult
                const proposalResult = yield this.proposalService.createProposalResult(proposal);
            }
            // this.log.debug('createdProposal:', JSON.stringify(proposal, null, 2));
            // this.log.debug('proposalResult:', JSON.stringify(proposalResult, null, 2));
            return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
        });
    }
    /**
     *
     * @param {module:resources.Proposal} proposal
     * @returns {Promise<module:resources.FlaggedItem>}
     */
    createFlaggedItemForProposal(proposal) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // if listingitem exists && theres no relation -> add relation to listingitem
            const listingItemModel = yield this.listingItemService.findOneByHash(proposal.title);
            const listingItem = listingItemModel.toJSON();
            const flaggedItemCreateRequest = {
                listing_item_id: listingItem.id,
                proposal_id: proposal.id,
                reason: proposal.description
            };
            const flaggedItemModel = yield this.flaggedItemService.create(flaggedItemCreateRequest);
            return flaggedItemModel.toJSON();
        });
    }
    /**
     *
     * @param {module:resources.Proposal} createdProposal
     * @param {ItemVote} itemVote
     * @returns {Promise<module:resources.Vote>}
     */
    createVote(createdProposal, itemVote) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currentBlock = yield this.coreRpcService.getBlockCount();
            const proposalOption = _.find(createdProposal.ProposalOptions, (option) => {
                return option.description === itemVote;
            });
            // this.log.debug('proposalOption:', JSON.stringify(proposalOption, null, 2));
            if (!proposalOption) {
                this.log.warn('ItemVote received that doesn\'t have REMOVE option.');
                throw new MessageException_1.MessageException('ItemVote received that doesn\'t have REMOVE option.');
            }
            // TODO: use VoteFactory
            // TODO: replace block with time
            const voteRequest = {
                proposal_option_id: proposalOption.id,
                voter: createdProposal.submitter,
                block: currentBlock,
                weight: 1
            };
            const createdVoteModel = yield this.voteService.create(voteRequest);
            return createdVoteModel.toJSON();
        });
    }
    configureEventListeners() {
        this.log.info('Configuring EventListeners ');
        this.eventEmitter.on(constants_1.Events.ProposalReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processProposalReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.error('PROCESSING ERROR: ', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PARSING_FAILED);
            }));
        }));
    }
};
ProposalActionService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Factory.ProposalFactory)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.ProposalService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.ProposalResultService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.ProposalOptionResultService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Service.SmsgMessageService)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Factory.VoteFactory)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Service.VoteService)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(10, inversify_1.named(constants_1.Targets.Service.FlaggedItemService)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(11, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(12, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(12, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ProposalFactory_1.ProposalFactory,
        CoreRpcService_1.CoreRpcService,
        SmsgService_1.SmsgService,
        ListingItemService_1.ListingItemService,
        ProposalService_1.ProposalService,
        ProposalResultService_1.ProposalResultService,
        ProposalOptionResultService_1.ProposalOptionResultService,
        SmsgMessageService_1.SmsgMessageService,
        VoteFactory_1.VoteFactory,
        VoteService_1.VoteService,
        FlaggedItemService_1.FlaggedItemService,
        events_1.EventEmitter, Object])
], ProposalActionService);
exports.ProposalActionService = ProposalActionService;
//# sourceMappingURL=ProposalActionService.js.map