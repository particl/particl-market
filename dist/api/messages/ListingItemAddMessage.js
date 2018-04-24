"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const MessageBody_1 = require("../../core/api/MessageBody");
const ListingItemMessageType_1 = require("../enums/ListingItemMessageType");
class ListingItemAddMessage extends MessageBody_1.MessageBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsEnum(ListingItemMessageType_1.ListingItemMessageType),
    tslib_1.__metadata("design:type", String)
], ListingItemAddMessage.prototype, "action", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ListingItemAddMessage.prototype, "item", void 0);
exports.ListingItemAddMessage = ListingItemAddMessage;
//# sourceMappingURL=ListingItemAddMessage.js.map