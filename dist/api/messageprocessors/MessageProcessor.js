"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const events_1 = require("../../core/api/events");
const SmsgService_1 = require("../services/SmsgService");
const BidMessageType_1 = require("../enums/BidMessageType");
const EscrowMessageType_1 = require("../enums/EscrowMessageType");
const InternalServerException_1 = require("../exceptions/InternalServerException");
let MessageProcessor = class MessageProcessor {
    // TODO: injecting listingItemService causes Error: knex: Required configuration option 'client' is missing.
    // tslint:disable:max-line-length
    constructor(
        // @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        smsgService, Logger, eventEmitter) {
        this.smsgService = smsgService;
        this.Logger = Logger;
        this.eventEmitter = eventEmitter;
        this.interval = 5000;
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length
    /**
     * main messageprocessor, ...
     *
     * @param {SmsgMessage[]} messages
     * @returns {Promise<void>}
     */
    process(messages) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('poll(), new messages:', JSON.stringify(messages, null, 2));
            for (const message of messages) {
                const parsed = yield this.parseJSONSafe(message.text);
                delete message.text;
                if (parsed) {
                    parsed.market = message.to;
                    // in case of ListingItemMessage
                    if (parsed.item) {
                        // ListingItemMessage, listingitemservice listens for this event
                        this.eventEmitter.emit(constants_1.Events.ListingItemReceivedEvent, {
                            smsgMessage: message,
                            marketplaceMessage: parsed
                        });
                        // send event to cli
                        this.eventEmitter.emit(constants_1.Events.Cli, {
                            message: constants_1.Events.ListingItemReceivedEvent,
                            data: parsed
                        });
                        // in case of ActionMessage, which is either BidMessage or EscrowMessage
                    }
                    else if (parsed.mpaction) {
                        // ActionMessage
                        const eventType = yield this.getActionEventType(parsed.mpaction);
                        this.eventEmitter.emit(eventType, {
                            smsgMessage: message,
                            marketplaceMessage: parsed
                        });
                        // send event to cli
                        this.eventEmitter.emit(constants_1.Events.Cli, {
                            message: eventType,
                            data: parsed
                        });
                    }
                    else {
                        // json object, but not something that we're expecting
                        this.log.error('received something unexpected: ', JSON.stringify(parsed, null, 2));
                    }
                }
            }
        });
    }
    stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
    schedulePoll() {
        this.timeout = setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.poll();
            this.schedulePoll();
        }), this.interval);
    }
    /**
     * main poller
     *
     * @returns {Promise<void>}
     */
    poll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.pollMessages()
                .then((messages) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (messages.result !== '0') {
                    const smsgMessages = messages.messages;
                    yield this.process(smsgMessages);
                }
                return;
            }))
                .catch(reason => {
                this.log.error('poll(), error:', reason);
                this.eventEmitter.emit('cli', {
                    message: 'poll(), error' + reason
                });
                return;
            });
        });
    }
    pollMessages() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.smsgService.smsgInbox('unread');
            // this.log.debug('got response:', response);
            return response;
        });
    }
    parseJSONSafe(json) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let parsed = null;
            try {
                parsed = JSON.parse(json);
            }
            catch (e) {
                this.log.error('parseJSONSafe, invalid JSON:', json);
            }
            return parsed;
        });
    }
    getActionEventType(message) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            switch (message.action) {
                case EscrowMessageType_1.EscrowMessageType.MPA_LOCK:
                    return constants_1.Events.LockEscrowReceivedEvent;
                case EscrowMessageType_1.EscrowMessageType.MPA_REQUEST_REFUND:
                    return constants_1.Events.RequestRefundEscrowReceivedEvent;
                case EscrowMessageType_1.EscrowMessageType.MPA_REFUND:
                    return constants_1.Events.RefundEscrowReceivedEvent;
                case EscrowMessageType_1.EscrowMessageType.MPA_RELEASE:
                    return constants_1.Events.ReleaseEscrowReceivedEvent;
                case BidMessageType_1.BidMessageType.MPA_BID:
                    return constants_1.Events.BidReceivedEvent;
                case BidMessageType_1.BidMessageType.MPA_ACCEPT:
                    return constants_1.Events.AcceptBidReceivedEvent;
                case BidMessageType_1.BidMessageType.MPA_REJECT:
                    return constants_1.Events.RejectBidReceivedEvent;
                case BidMessageType_1.BidMessageType.MPA_CANCEL:
                    return constants_1.Events.CancelBidReceivedEvent;
                default:
                    throw new InternalServerException_1.InternalServerException('Unknown action message.');
            }
        });
    }
};
MessageProcessor = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__metadata("design:paramtypes", [SmsgService_1.SmsgService, Object, events_1.EventEmitter])
], MessageProcessor);
exports.MessageProcessor = MessageProcessor;
//# sourceMappingURL=MessageProcessor.js.map