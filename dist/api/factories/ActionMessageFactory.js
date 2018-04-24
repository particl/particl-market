"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const BidMessageType_1 = require("../enums/BidMessageType");
const EscrowMessageType_1 = require("../enums/EscrowMessageType");
const InternalServerException_1 = require("../exceptions/InternalServerException");
const ListingItemMessageType_1 = require("../enums/ListingItemMessageType");
let ActionMessageFactory = class ActionMessageFactory {
    constructor(Logger) {
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    getModel(message, listingItemId, smsgMessage) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let actionMessageCreateRequest;
            const data = this.getModelMessageData(smsgMessage);
            switch (message.action) {
                case ListingItemMessageType_1.ListingItemMessageType.MP_ITEM_ADD:
                    const listingItemMessage = message;
                    const listingItemobjects = this.getModelMessageObjects(listingItemMessage);
                    actionMessageCreateRequest = {
                        listing_item_id: listingItemId,
                        action: listingItemMessage.action.toString(),
                        objects: listingItemobjects,
                        data
                    };
                    break;
                case BidMessageType_1.BidMessageType.MPA_BID:
                case BidMessageType_1.BidMessageType.MPA_ACCEPT:
                case BidMessageType_1.BidMessageType.MPA_REJECT:
                case BidMessageType_1.BidMessageType.MPA_CANCEL:
                    const bidMessage = message;
                    const objects = this.getModelMessageObjects(bidMessage);
                    actionMessageCreateRequest = {
                        listing_item_id: listingItemId,
                        action: bidMessage.action.toString(),
                        objects,
                        data
                    };
                    break;
                case EscrowMessageType_1.EscrowMessageType.MPA_LOCK:
                case EscrowMessageType_1.EscrowMessageType.MPA_REQUEST_REFUND:
                case EscrowMessageType_1.EscrowMessageType.MPA_REFUND:
                case EscrowMessageType_1.EscrowMessageType.MPA_RELEASE:
                    const escrowMessage = message;
                    // MPA-RELEASE& MPA-REFUND & MPA-REQUEST-REFUND can have memo in a weird place
                    if (escrowMessage.memo) {
                        if (!escrowMessage.info) {
                            escrowMessage.info = {};
                        }
                        escrowMessage.info.memo = escrowMessage.memo;
                    }
                    actionMessageCreateRequest = {
                        listing_item_id: listingItemId,
                        action: escrowMessage.action.toString(),
                        nonce: escrowMessage.nonce,
                        accepted: escrowMessage.accepted,
                        info: escrowMessage.info,
                        escrow: escrowMessage.escrow,
                        data
                    };
                    break;
                default:
                    throw new InternalServerException_1.InternalServerException('Unknown message action type.');
            }
            return actionMessageCreateRequest;
        });
    }
    getModelMessageObjects(bidMessage) {
        const createRequests = [];
        if (bidMessage.objects) {
            for (const messageObject of bidMessage.objects) {
                const createRequest = {
                    dataId: messageObject.id,
                    dataValue: messageObject.value
                };
                createRequests.push(createRequest);
            }
        }
        return createRequests;
    }
    getModelMessageData(smsgMessage) {
        return {
            msgid: smsgMessage.msgid,
            version: smsgMessage.version,
            received: new Date(smsgMessage.received),
            sent: new Date(smsgMessage.sent),
            from: smsgMessage.from,
            to: smsgMessage.to
        };
    }
};
ActionMessageFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], ActionMessageFactory);
exports.ActionMessageFactory = ActionMessageFactory;
//# sourceMappingURL=ActionMessageFactory.js.map