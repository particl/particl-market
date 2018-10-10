"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DefaultItemCategoryService_1 = require("../services/DefaultItemCategoryService");
const DefaultProfileService_1 = require("../services/DefaultProfileService");
const DefaultMarketService_1 = require("../services/DefaultMarketService");
const events_1 = require("../../core/api/events");
const MessageProcessor_1 = require("../messageprocessors/MessageProcessor");
const CoreRpcService_1 = require("../services/CoreRpcService");
const ExpiredListingItemProcessor_1 = require("../messageprocessors/ExpiredListingItemProcessor");
const SmsgMessageProcessor_1 = require("../messageprocessors/SmsgMessageProcessor");
const Environment_1 = require("../../core/helpers/Environment");
const ListingItemActionService_1 = require("../services/ListingItemActionService");
const BidActionService_1 = require("../services/BidActionService");
const EscrowActionService_1 = require("../services/EscrowActionService");
const ProposalActionService_1 = require("../services/ProposalActionService");
const VoteActionService_1 = require("../services/VoteActionService");
let ServerStartedListener = class ServerStartedListener {
    // tslint:disable:max-line-length
    constructor(messageProcessor, smsgMessageProcessor, expiredListingItemProcessor, defaultItemCategoryService, defaultProfileService, defaultMarketService, coreRpcService, listingItemActionService, bidActionService, escrowActionService, proposalActionService, voteActionService, eventEmitter, Logger) {
        // ActionServices need to be injected here to start the event listeners when testing
        this.messageProcessor = messageProcessor;
        this.smsgMessageProcessor = smsgMessageProcessor;
        this.expiredListingItemProcessor = expiredListingItemProcessor;
        this.defaultItemCategoryService = defaultItemCategoryService;
        this.defaultProfileService = defaultProfileService;
        this.defaultMarketService = defaultMarketService;
        this.coreRpcService = coreRpcService;
        this.listingItemActionService = listingItemActionService;
        this.bidActionService = bidActionService;
        this.escrowActionService = escrowActionService;
        this.proposalActionService = proposalActionService;
        this.voteActionService = voteActionService;
        this.eventEmitter = eventEmitter;
        this.isAppReady = false;
        this.isStarted = false;
        this.previousState = false;
        this.interval = 1000;
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length
    /**
     *
     * @param payload
     * @returns {Promise<void>}
     */
    act(payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.info('Received event ServerStartedListenerEvent', payload);
            this.isAppReady = true;
            this.pollForConnection();
        });
    }
    pollForConnection() {
        this.timeout = setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.isStarted = yield this.checkConnection();
            this.pollForConnection();
        }), this.interval);
    }
    stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
    checkConnection() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const isConnected = yield this.coreRpcService.isConnected();
            if (isConnected) {
                if (this.previousState !== isConnected) {
                    this.log.info('connection with particld established.');
                    // seed the default market
                    yield this.defaultMarketService.seedDefaultMarket();
                    // seed the default categories
                    yield this.defaultItemCategoryService.seedDefaultCategories();
                    // seed the default Profile
                    yield this.defaultProfileService.seedDefaultProfile();
                    // start expiredListingItemProcessor
                    this.expiredListingItemProcessor.scheduleProcess();
                    // start message polling, unless we're running tests
                    if (!Environment_1.Environment.isTest()) {
                        this.smsgMessageProcessor.schedulePoll();
                        this.messageProcessor.schedulePoll();
                    }
                    this.interval = 10000;
                }
                // this.log.info('connected to particld, checking again in ' + this.interval + 'ms.');
            }
            else {
                if (this.previousState !== isConnected) {
                    this.log.info('connection with particld disconnected.');
                    // stop message polling
                    this.messageProcessor.stop();
                    this.interval = 1000;
                }
                if (process.env.NODE_ENV !== 'test') {
                    this.log.error('failed to connect to particld, retrying in ' + this.interval + 'ms.');
                }
            }
            this.previousState = isConnected;
            return isConnected;
        });
    }
};
ServerStartedListener.Event = Symbol('ServerStartedListenerEvent');
ServerStartedListener.ServerReadyEvent = Symbol('ServerReadyListenerEvent');
ServerStartedListener = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.MessageProcessor)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.MessageProcessor.MessageProcessor)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.MessageProcessor)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.MessageProcessor.SmsgMessageProcessor)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.MessageProcessor)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.MessageProcessor.ExpiredListingItemProcessor)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.DefaultItemCategoryService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.DefaultProfileService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.DefaultMarketService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Service.ListingItemActionService)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Service.BidActionService)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Service.EscrowActionService)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(10, inversify_1.named(constants_1.Targets.Service.ProposalActionService)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(11, inversify_1.named(constants_1.Targets.Service.VoteActionService)),
    tslib_1.__param(12, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(12, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(13, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(13, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MessageProcessor_1.MessageProcessor,
        SmsgMessageProcessor_1.SmsgMessageProcessor,
        ExpiredListingItemProcessor_1.ExpiredListingItemProcessor,
        DefaultItemCategoryService_1.DefaultItemCategoryService,
        DefaultProfileService_1.DefaultProfileService,
        DefaultMarketService_1.DefaultMarketService,
        CoreRpcService_1.CoreRpcService,
        ListingItemActionService_1.ListingItemActionService,
        BidActionService_1.BidActionService,
        EscrowActionService_1.EscrowActionService,
        ProposalActionService_1.ProposalActionService,
        VoteActionService_1.VoteActionService,
        events_1.EventEmitter, Object])
], ServerStartedListener);
exports.ServerStartedListener = ServerStartedListener;
//# sourceMappingURL=ServerStartedListener.js.map