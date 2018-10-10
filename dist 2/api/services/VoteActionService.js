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
const VoteFactory_1 = require("../factories/VoteFactory");
const VoteService_1 = require("./VoteService");
const VoteMessageType_1 = require("../enums/VoteMessageType");
const CoreRpcService_1 = require("./CoreRpcService");
const MessageException_1 = require("../exceptions/MessageException");
const ProposalService_1 = require("./ProposalService");
const ProposalResultService_1 = require("./ProposalResultService");
const ProposalOptionService_1 = require("./ProposalOptionService");
const ProposalOptionResultService_1 = require("./ProposalOptionResultService");
const ProposalType_1 = require("../enums/ProposalType");
const ListingItemService_1 = require("./ListingItemService");
const SmsgMessageService_1 = require("./SmsgMessageService");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
let VoteActionService = class VoteActionService {
    constructor(voteFactory, smsgService, coreRpcService, proposalService, proposalOptionService, proposalResultService, proposalOptionResultService, voteService, listingItemService, smsgMessageService, eventEmitter, Logger) {
        this.voteFactory = voteFactory;
        this.smsgService = smsgService;
        this.coreRpcService = coreRpcService;
        this.proposalService = proposalService;
        this.proposalOptionService = proposalOptionService;
        this.proposalResultService = proposalResultService;
        this.proposalOptionResultService = proposalOptionResultService;
        this.voteService = voteService;
        this.listingItemService = listingItemService;
        this.smsgMessageService = smsgMessageService;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }
    /**
     *
     * @param {"resources".Proposal} proposal
     * @param {"resources".ProposalOption} proposalOption
     * @param {"resources".Profile} senderProfile
     * @param {"resources".Market} marketplace
     * @returns {Promise<SmsgSendResponse>}
     */
    send(proposal, proposalOption, senderProfile, marketplace) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currentBlock = yield this.coreRpcService.getBlockCount();
            const voteMessage = yield this.voteFactory.getMessage(VoteMessageType_1.VoteMessageType.MP_VOTE, proposal, proposalOption, senderProfile, currentBlock);
            const msg = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: voteMessage
            };
            return this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, false);
        });
    }
    /**
     * process received VoteMessage
     * - save ActionMessage
     * - create Proposal
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    processVoteReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const message = event.marketplaceMessage;
            if (!message.mpaction) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            const voteMessage = event.marketplaceMessage.mpaction;
            if (voteMessage.voter !== event.smsgMessage.from) {
                throw new MessageException_1.MessageException('Voter does not match with sender.');
            }
            // get proposal and ignore vote if we're past the final block of the proposal
            return yield this.proposalService.findOneByHash(voteMessage.proposalHash)
                .then((proposalModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const proposal = proposalModel.toJSON();
                // just make sure we have one
                if (_.isEmpty(proposal.ProposalResults)) {
                    throw new MessageException_1.MessageException('ProposalResult should not be empty!');
                }
                const currentBlock = yield this.coreRpcService.getBlockCount();
                // this.log.debug('before update, proposal:', JSON.stringify(proposal, null, 2));
                if (voteMessage && proposal.blockEnd >= currentBlock) {
                    const createdVote = yield this.createOrUpdateVote(voteMessage, proposal, currentBlock, 1);
                    this.log.debug('created/updated Vote:', JSON.stringify(createdVote, null, 2));
                    const proposalResult = yield this.proposalService.recalculateProposalResult(proposal);
                    // todo: extract method
                    if (proposal.type === ProposalType_1.ProposalType.ITEM_VOTE
                        && (yield this.shouldRemoveListingItem(proposalResult))) {
                        // remove the ListingItem from the marketplace (unless user has Bid/Order related to it).
                        const listingItemId = yield this.listingItemService.findOne(proposal.ListingItem.id, false)
                            .then(value => {
                            return value.Id;
                        }).catch(reason => {
                            // ignore
                            return null;
                        });
                        if (listingItemId) {
                            yield this.listingItemService.destroy(listingItemId);
                        }
                    }
                    // TODO: do whatever else needs to be done
                    return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
                }
                else {
                    throw new MessageException_1.MessageException('Missing VoteMessage');
                }
            }))
                .catch(reason => {
                return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
            });
        });
    }
    /**
     * todo: move to listingItemService
     *
     * @param {"resources".ProposalResult} proposalResult
     * @returns {Promise<boolean>}
     */
    shouldRemoveListingItem(proposalResult) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const okOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult) => {
                return proposalOptionResult.ProposalOption.optionId === 0;
            });
            const removeOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult) => {
                return proposalOptionResult.ProposalOption.optionId === 1; // 1 === REMOVE
            });
            // Requirements to remove the ListingItem from the testnet marketplace, these should also be configurable:
            // at minimum, a total of 10 votes
            // at minimum, 30% of votes saying remove
            if (removeOptionResult && okOptionResult && removeOptionResult.weight > 10
                && (removeOptionResult.weight / (removeOptionResult.weight + okOptionResult.weight) > 0.3)) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    /**
     *
     * @param {VoteMessage} voteMessage
     * @param {"resources".Proposal} proposal
     * @param {number} currentBlock
     * @param {number} weight
     * @returns {Promise<"resources".Vote>}
     */
    createOrUpdateVote(voteMessage, proposal, currentBlock, weight) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let lastVote;
            try {
                const lastVoteModel = yield this.voteService.findOneByVoterAndProposalId(voteMessage.voter, proposal.id);
                lastVote = lastVoteModel.toJSON();
            }
            catch (ex) {
                lastVote = null;
            }
            const create = lastVote == null;
            // create a vote
            const voteRequest = yield this.voteFactory.getModel(voteMessage, proposal, currentBlock, weight, create);
            let voteModel;
            if (create) {
                // this.log.debug('Creating vote request = ' + JSON.stringify(voteRequest, null, 2));
                voteModel = yield this.voteService.create(voteRequest);
            }
            else {
                // this.log.debug(`Updating vote with id = ${lastVote.id}, vote request = ` + JSON.stringify(voteRequest, null, 2));
                voteModel = yield this.voteService.update(lastVote.id, voteRequest);
                // this.voteService.destroy(lastVote.id);
                // voteModel = await this.voteService.create(voteRequest as VoteCreateRequest);
            }
            if (!voteModel) {
                this.log.error('VoteActionService.createOrUpdateVote(): Vote wasn\'t saved or updated properly. Return val is empty.');
                throw new MessageException_1.MessageException('Vote wasn\'t saved or updated properly. Return val is empty.');
            }
            const vote = voteModel.toJSON();
            return vote;
        });
    }
    configureEventListeners() {
        this.log.info('Configuring EventListeners ');
        this.eventEmitter.on(constants_1.Events.VoteReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processVoteReceivedEvent(event)
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
VoteActionService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Factory.VoteFactory)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ProposalService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.ProposalOptionService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.ProposalResultService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.ProposalOptionResultService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Service.VoteService)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Service.SmsgMessageService)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(10, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(11, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [VoteFactory_1.VoteFactory,
        SmsgService_1.SmsgService,
        CoreRpcService_1.CoreRpcService,
        ProposalService_1.ProposalService,
        ProposalOptionService_1.ProposalOptionService,
        ProposalResultService_1.ProposalResultService,
        ProposalOptionResultService_1.ProposalOptionResultService,
        VoteService_1.VoteService,
        ListingItemService_1.ListingItemService,
        SmsgMessageService_1.SmsgMessageService,
        events_1.EventEmitter, Object])
], VoteActionService);
exports.VoteActionService = VoteActionService;
//# sourceMappingURL=VoteActionService.js.map