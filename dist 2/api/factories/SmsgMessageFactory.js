"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const MessageException_1 = require("../exceptions/MessageException");
const ListingItemMessageType_1 = require("../enums/ListingItemMessageType");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
let SmsgMessageFactory = class SmsgMessageFactory {
    constructor(Logger) {
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    get(message) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.parseJSONSafe(message.text)
                .then(marketplaceMessage => {
                const type = this.getType(marketplaceMessage);
                const status = SmsgMessageStatus_1.SmsgMessageStatus.NEW;
                const createRequest = {
                    type,
                    status,
                    msgid: message.msgid,
                    version: message.version,
                    read: message.read,
                    paid: message.paid,
                    payloadsize: message.payloadsize,
                    received: message.received * 1000,
                    sent: message.sent * 1000,
                    expiration: message.expiration * 1000,
                    daysretention: message.daysretention,
                    from: message.from,
                    to: message.to,
                    text: message.text
                };
                return createRequest;
            })
                .catch(reason => {
                const type = 'UNKNOWN';
                const status = SmsgMessageStatus_1.SmsgMessageStatus.PARSING_FAILED;
                const createRequest = {
                    type,
                    status,
                    msgid: message.msgid,
                    version: message.version,
                    read: message.read,
                    paid: message.paid,
                    payloadsize: message.payloadsize,
                    received: message.received * 1000,
                    sent: message.sent * 1000,
                    expiration: message.expiration * 1000,
                    daysretention: message.daysretention,
                    from: message.from,
                    to: message.to,
                    text: message.text
                };
                return createRequest;
            });
        });
    }
    getMarketplaceMessage(message) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.parseJSONSafe(message.text)
                .then(marketplaceMessage => {
                return marketplaceMessage;
            })
                .catch(reason => {
                return null;
            });
        });
    }
    parseJSONSafe(json) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let parsed;
            try {
                // this.log.debug('json to parse:', json);
                parsed = JSON.parse(json);
            }
            catch (e) {
                this.log.error('parseJSONSafe, invalid JSON:', json);
                throw new MessageException_1.MessageException('Could not parse the incoming message.');
            }
            return parsed;
        });
    }
    getType(marketplaceMessage) {
        if (marketplaceMessage.item) {
            // in case of ListingItemMessage
            // todo: later we need to add support for other ListingItemMessageTypes
            // todo: actually the structure of ListingItemMessage should be the same as others
            return ListingItemMessageType_1.ListingItemMessageType.MP_ITEM_ADD;
        }
        else if (marketplaceMessage.mpaction) {
            // in case of ActionMessage
            return marketplaceMessage.mpaction.action;
        }
        else {
            // json object, but not something that we're expecting
            this.log.warn('Unexpected message, unable to get MessageType: ', JSON.stringify(marketplaceMessage, null, 2));
            throw new MessageException_1.MessageException('Could not get the message type.');
        }
    }
};
SmsgMessageFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], SmsgMessageFactory);
exports.SmsgMessageFactory = SmsgMessageFactory;
//# sourceMappingURL=SmsgMessageFactory.js.map