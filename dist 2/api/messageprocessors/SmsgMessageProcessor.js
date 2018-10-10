"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const events_1 = require("../../core/api/events");
const SmsgService_1 = require("../services/SmsgService");
const SmsgMessageService_1 = require("../services/SmsgMessageService");
const SmsgMessageFactory_1 = require("../factories/SmsgMessageFactory");
let SmsgMessageProcessor = class SmsgMessageProcessor {
    // tslint:disable:max-line-length
    constructor(smsgMessageFactory, smsgMessageService, smsgService, Logger, eventEmitter) {
        this.smsgMessageFactory = smsgMessageFactory;
        this.smsgMessageService = smsgMessageService;
        this.smsgService = smsgService;
        this.Logger = Logger;
        this.eventEmitter = eventEmitter;
        this.interval = 5000;
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length
    /**
     * polls for new smsgmessages and stores them in the database
     *
     * @param {SmsgMessage[]} messages
     * @returns {Promise<void>}
     */
    process(messages) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const message of messages) {
                // get the message again using smsg, since the smsginbox doesnt return expiration
                const msg = yield this.smsgService.smsg(message.msgid, false, true);
                const smsgMessageCreateRequest = yield this.smsgMessageFactory.get(msg);
                // this.log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
                yield this.smsgMessageService.create(smsgMessageCreateRequest)
                    .then((smsgMessageModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const smsgMessage = smsgMessageModel.toJSON();
                    this.log.debug('INCOMING SMSGMESSAGE: '
                        + smsgMessage.from + ' => ' + smsgMessage.to
                        + ' : ' + smsgMessage.type
                        + ' : ' + smsgMessage.status
                        + ' : ' + smsgMessage.msgid);
                    // after message is stored, remove it
                    yield this.smsgService.smsg(message.msgid, true, true);
                }))
                    .catch(reason => {
                    this.log.error('ERROR: ', reason);
                });
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
                this.log.error('poll(), error: ' + reason);
                return;
            });
        });
    }
    /**
     * TODO: should not fetch all unreads at the same time
     *
     * @returns {Promise<any>}
     */
    pollMessages() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.smsgService.smsgInbox('unread');
            return response;
        });
    }
};
SmsgMessageProcessor = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Factory.SmsgMessageFactory)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.SmsgMessageService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(4, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__metadata("design:paramtypes", [SmsgMessageFactory_1.SmsgMessageFactory,
        SmsgMessageService_1.SmsgMessageService,
        SmsgService_1.SmsgService, Object, events_1.EventEmitter])
], SmsgMessageProcessor);
exports.SmsgMessageProcessor = SmsgMessageProcessor;
//# sourceMappingURL=SmsgMessageProcessor.js.map