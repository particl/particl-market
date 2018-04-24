"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const EscrowMessageType_1 = require("../enums/EscrowMessageType");
const MessageBody_1 = require("../../core/api/MessageBody");
class EscrowMessage extends MessageBody_1.MessageBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsEnum(EscrowMessageType_1.EscrowMessageType),
    tslib_1.__metadata("design:type", String)
], EscrowMessage.prototype, "action", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], EscrowMessage.prototype, "item", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Object)
], EscrowMessage.prototype, "escrow", void 0);
exports.EscrowMessage = EscrowMessage;
//# sourceMappingURL=EscrowMessage.js.map