"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const EscrowMessageType_1 = require("../enums/EscrowMessageType");
const NotImplementedException_1 = require("../exceptions/NotImplementedException");
let EscrowFactory = class EscrowFactory {
    constructor(Logger) {
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * Factory which will create an EscrowMessage
     *
     * @param request, EscrowLockRequest | EscrowRefundRequest | EscrowReleaseRequest
     * @param escrow
     * @param address
     *
     * @returns {EscrowMessage}
     */
    getMessage(request, rawtx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: validity check
            // this.checkEscrowActionValidity(request.action, escrow);
            switch (request.action) {
                case EscrowMessageType_1.EscrowMessageType.MPA_LOCK:
                    return yield this.getLockMessage(request, rawtx);
                case EscrowMessageType_1.EscrowMessageType.MPA_RELEASE:
                    return yield this.getReleaseMessage(request, rawtx);
                case EscrowMessageType_1.EscrowMessageType.MPA_REFUND:
                    return yield this.getRefundMessage(request, rawtx);
                default:
                    throw new NotImplementedException_1.NotImplementedException();
            }
        });
    }
    /**
     * Factory will return model based on the message
     *
     * @param data
     * @returns {Escrow}
     */
    getModel(data) {
        // TODO:
        return {};
    }
    /**
     * creates the EscrowMessage for EscrowLockRequest
     *
     * @param lockRequest
     * @param escrow
     * @returns {EscrowMessage}
     */
    getLockMessage(request, rawtx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                action: request.action,
                item: request.orderItem.itemHash,
                nonce: request.nonce,
                info: {
                    memo: request.memo
                },
                escrow: {
                    type: 'lock',
                    rawtx
                }
            };
        });
    }
    /**
     * creates the EscrowMessage for EscrowReleaseRequest
     *
     * @param releaseRequest
     * @param escrow
     */
    getReleaseMessage(request, rawtx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                action: request.action,
                item: request.orderItem.itemHash,
                memo: request.memo,
                escrow: {
                    type: 'release',
                    rawtx
                }
            };
        });
    }
    /**
     * creates the EscrowMessage for EscrowRefundRequest
     *
     * @param refundRequest
     * @param escrow
     */
    getRefundMessage(request, rawtx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                action: request.action,
                item: request.orderItem.itemHash,
                accepted: request.accepted,
                memo: request.memo,
                escrow: {
                    type: 'refund',
                    rawtx
                }
            };
        });
    }
    /**
     * Checks if the escrowAction is allowed for the given escrow
     *
     * @param escrowAction
     * @param escrow
     * @returns {boolean}
     */
    checkEscrowActionValidity(escrowAction, escrow) {
        let isValid = true;
        // TODO: implement
        if (!isValid) {
            isValid = false;
            // throw new MessageException('Action is not valid for the Escrow');
        }
        return isValid;
    }
};
EscrowFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], EscrowFactory);
exports.EscrowFactory = EscrowFactory;
//# sourceMappingURL=EscrowFactory.js.map