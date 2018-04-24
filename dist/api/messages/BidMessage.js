"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const MessageBody_1 = require("../../core/api/MessageBody");
class BidMessage extends MessageBody_1.MessageBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], BidMessage.prototype, "item", void 0);
exports.BidMessage = BidMessage;
//# sourceMappingURL=BidMessage.js.map