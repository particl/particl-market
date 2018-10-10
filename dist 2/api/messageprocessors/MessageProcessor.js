"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const events_1 = require("../../core/api/events");
const BidMessageType_1 = require("../enums/BidMessageType");
const EscrowMessageType_1 = require("../enums/EscrowMessageType");
const ProposalMessageType_1 = require("../enums/ProposalMessageType");
const VoteMessageType_1 = require("../enums/VoteMessageType");
const SmsgMessageService_1 = require("../services/SmsgMessageService");
const ListingItemMessageType_1 = require("../enums/ListingItemMessageType");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
const SearchOrder_1 = require("../enums/SearchOrder");
const SmsgMessageFactory_1 = require("../factories/SmsgMessageFactory");
let MessageProcessor = class MessageProcessor {
    // tslint:disable:max-line-length
    constructor(smsgMessageFactory, smsgMessageService, Logger, eventEmitter) {
        this.smsgMessageFactory = smsgMessageFactory;
        this.smsgMessageService = smsgMessageService;
        this.Logger = Logger;
        this.eventEmitter = eventEmitter;
        this.pollCount = 0;
        this.DEFAULT_INTERVAL = 5 * 1000;
        this.LISTINGITEM_MESSAGES = [ListingItemMessageType_1.ListingItemMessageType.MP_ITEM_ADD];
        this.BID_MESSAGES = [BidMessageType_1.BidMessageType.MPA_BID, BidMessageType_1.BidMessageType.MPA_ACCEPT, BidMessageType_1.BidMessageType.MPA_REJECT, BidMessageType_1.BidMessageType.MPA_CANCEL];
        this.ESCROW_MESSAGES = [EscrowMessageType_1.EscrowMessageType.MPA_LOCK, EscrowMessageType_1.EscrowMessageType.MPA_RELEASE, EscrowMessageType_1.EscrowMessageType.MPA_REQUEST_REFUND, EscrowMessageType_1.EscrowMessageType.MPA_REFUND];
        this.PROPOSAL_MESSAGES = [ProposalMessageType_1.ProposalMessageType.MP_PROPOSAL_ADD];
        this.VOTE_MESSAGES = [VoteMessageType_1.VoteMessageType.MP_VOTE];
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length
    /**
     * main messageprocessor, ...
     *
     * @param {module:resources.SmsgMessage[]} smsgMessages
     * @param {boolean} emitEvent
     * @returns {Promise<void>}
     */
    process(smsgMessages, emitEvent = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const smsgMessage of smsgMessages) {
                this.log.debug('PROCESSING: ', smsgMessage.msgid);
                // this.log.debug('smsgMessage:', JSON.stringify(smsgMessage, null, 2));
                // TODO: throw instead of returning null
                const marketplaceMessage = yield this.smsgMessageFactory.getMarketplaceMessage(smsgMessage);
                const eventType = yield this.getEventForMessageType(smsgMessage.type);
                // this.log.debug('marketplaceMessage:', JSON.stringify(marketplaceMessage, null, 2));
                // this.log.debug('eventType:', JSON.stringify(eventType, null, 2));
                // this.log.debug('emitEvent:', JSON.stringify(emitEvent, null, 2));
                if (marketplaceMessage !== null && eventType !== null) {
                    if (emitEvent) {
                        // todo: check if this is actually necessary?
                        marketplaceMessage.market = smsgMessage.to;
                        smsgMessage.text = '';
                        const marketplaceEvent = {
                            smsgMessage,
                            marketplaceMessage
                        };
                        this.log.debug('SMSGMESSAGE: '
                            + smsgMessage.from + ' => ' + smsgMessage.to
                            + ' : ' + smsgMessage.type
                            + ' : ' + smsgMessage.status
                            + ' : ' + smsgMessage.msgid);
                        // this.log.debug('SENDING: ', eventType);
                        // send event to the eventTypes processor
                        this.eventEmitter.emit(eventType, marketplaceEvent);
                        // send event to cli
                        // todo: send marketplaceEvent
                        this.eventEmitter.emit(constants_1.Events.Cli, {
                            message: eventType,
                            data: marketplaceMessage
                        });
                    }
                }
                else {
                    this.log.debug('marketplaceMessage:', JSON.stringify(marketplaceMessage, null, 2));
                    this.log.debug('eventType:', JSON.stringify(eventType, null, 2));
                    this.log.debug('emitEvent:', JSON.stringify(emitEvent, null, 2));
                    this.log.debug('PROCESSING: ' + smsgMessage.msgid + ' PARSING FAILED');
                    yield this.smsgMessageService.updateSmsgMessageStatus(smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PARSING_FAILED);
                }
            }
        });
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }
    schedulePoll(pollingInterval = this.DEFAULT_INTERVAL) {
        // this.log.debug('schedulePoll(), pollingInterval: ', pollingInterval);
        /*
                this.timeout = setTimeout(
                    async () => {
                        pollingInterval = await this.poll();
                        this.schedulePoll(pollingInterval);
                        this.log.debug('schedulePoll(), done: ', timeout);
                    },
                    pollingInterval
                );
        */
        this.interval = setInterval(() => {
            clearInterval(this.interval);
            this.poll().then(interval => {
                this.schedulePoll(interval); // re-run
            });
        }, pollingInterval);
    }
    /**
     * main poller
     *
     * @returns {Promise<void>}
     */
    poll(emitEvent = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const startTime = new Date().getTime();
            // fetch and process new ProposalMessages
            // fetch and process new VoteMessages
            // fetch and process new ListingItemMessages
            // fetch and process new BidMessages
            // fetch and process new EscrowMessages
            // fetch and process the waiting ones
            const searchParams = [
                { types: this.PROPOSAL_MESSAGES, status: SmsgMessageStatus_1.SmsgMessageStatus.NEW, amount: 10, nextInverval: this.DEFAULT_INTERVAL },
                { types: this.VOTE_MESSAGES, status: SmsgMessageStatus_1.SmsgMessageStatus.NEW, amount: 10, nextInverval: this.DEFAULT_INTERVAL },
                { types: this.LISTINGITEM_MESSAGES, status: SmsgMessageStatus_1.SmsgMessageStatus.NEW, amount: 1, nextInverval: this.DEFAULT_INTERVAL },
                { types: this.BID_MESSAGES, status: SmsgMessageStatus_1.SmsgMessageStatus.NEW, amount: 10, nextInverval: this.DEFAULT_INTERVAL },
                { types: this.ESCROW_MESSAGES, status: SmsgMessageStatus_1.SmsgMessageStatus.NEW, amount: 10, nextInverval: this.DEFAULT_INTERVAL },
                { types: [], status: SmsgMessageStatus_1.SmsgMessageStatus.WAITING, amount: 10, nextInverval: this.DEFAULT_INTERVAL }
            ];
            let fetchNext = true;
            let nextInterval = 1000;
            // search for different types of messages in order: proposal -> vote -> listingitem -> ...
            for (const params of searchParams) {
                // if we find messages, skip fetching more until we poll for more
                if (fetchNext) {
                    // this.log.debug('MessageProcessor.poll #' + this.pollCount + ': find: ' + JSON.stringify(params));
                    fetchNext = yield this.getSmsgMessages(params.types, params.status, params.amount)
                        .then((smsgMessages) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        // this.log.debug('smsgMessages: ' + JSON.stringify(smsgMessages, null, 2));
                        if (!_.isEmpty(smsgMessages)) {
                            for (const smsgMessage of smsgMessages) {
                                yield this.smsgMessageService.updateSmsgMessageStatus(smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING);
                                smsgMessage.status = SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING;
                            }
                            yield this.process(smsgMessages, emitEvent);
                            // we just processed certain types of messages, so skip processing the next types until we
                            // have processed all of these
                            return false;
                        }
                        else {
                            nextInterval = params.nextInverval;
                            // move to process the next types of messages
                            return true;
                        }
                    }))
                        .catch(reason => {
                        this.log.error('Messageprocessor.poll(), ERROR: ', reason);
                        return true;
                    });
                    // this.log.debug('Messageprocessor.poll(), fetchNext: ', fetchNext);
                }
            }
            this.log.debug('MessageProcessor.poll #' + this.pollCount + ': ' + (new Date().getTime() - startTime) + 'ms');
            this.pollCount++;
            return nextInterval;
        });
    }
    /**
     *
     * @param {any[]} types
     * @param {SmsgMessageStatus} status
     * @param {number} amount
     * @returns {Promise<module:resources.SmsgMessage[]>}
     */
    getSmsgMessages(types, // ListingItemMessageType | BidMessageType | EscrowMessageType | ProposalMessageType | VoteMessageType,
        status, amount = 10) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const searchParams = {
                order: SearchOrder_1.SearchOrder.DESC,
                orderByColumn: 'received',
                status,
                types,
                page: 0,
                pageLimit: amount,
                age: 1000 * 20
            };
            const messagesModel = yield this.smsgMessageService.searchBy(searchParams);
            const messages = messagesModel.toJSON();
            if (messages.length > 0) {
                this.log.debug('found ' + messages.length + ' messages. types: [' + types + '], status: ' + status);
            }
            return messages;
        });
    }
    getEventForMessageType(messageType) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            switch (messageType) {
                case BidMessageType_1.BidMessageType.MPA_BID:
                    return constants_1.Events.BidReceivedEvent;
                case BidMessageType_1.BidMessageType.MPA_ACCEPT:
                    return constants_1.Events.AcceptBidReceivedEvent;
                case BidMessageType_1.BidMessageType.MPA_REJECT:
                    return constants_1.Events.RejectBidReceivedEvent;
                case BidMessageType_1.BidMessageType.MPA_CANCEL:
                    return constants_1.Events.CancelBidReceivedEvent;
                case EscrowMessageType_1.EscrowMessageType.MPA_LOCK:
                    return constants_1.Events.LockEscrowReceivedEvent;
                case EscrowMessageType_1.EscrowMessageType.MPA_REQUEST_REFUND:
                    return constants_1.Events.RequestRefundEscrowReceivedEvent;
                case EscrowMessageType_1.EscrowMessageType.MPA_REFUND:
                    return constants_1.Events.RefundEscrowReceivedEvent;
                case EscrowMessageType_1.EscrowMessageType.MPA_RELEASE:
                    return constants_1.Events.ReleaseEscrowReceivedEvent;
                case ProposalMessageType_1.ProposalMessageType.MP_PROPOSAL_ADD:
                    return constants_1.Events.ProposalReceivedEvent;
                case VoteMessageType_1.VoteMessageType.MP_VOTE:
                    return constants_1.Events.VoteReceivedEvent;
                case ListingItemMessageType_1.ListingItemMessageType.MP_ITEM_ADD:
                    return constants_1.Events.ListingItemReceivedEvent;
                case ListingItemMessageType_1.ListingItemMessageType.UNKNOWN:
                default:
                    return null;
            }
        });
    }
};
MessageProcessor = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Factory.SmsgMessageFactory)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.SmsgMessageService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__metadata("design:paramtypes", [SmsgMessageFactory_1.SmsgMessageFactory,
        SmsgMessageService_1.SmsgMessageService, Object, events_1.EventEmitter])
], MessageProcessor);
exports.MessageProcessor = MessageProcessor;
//# sourceMappingURL=MessageProcessor.js.map