"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const MessagingProtocolType_1 = require("../../api/enums/MessagingProtocolType");
// tslint:disable:variable-name
class MessagingInformationCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsEnum(MessagingProtocolType_1.MessagingProtocolType),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], MessagingInformationCreateRequest.prototype, "protocol", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], MessagingInformationCreateRequest.prototype, "publicKey", void 0);
exports.MessagingInformationCreateRequest = MessagingInformationCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=MessagingInformationCreateRequest.js.map