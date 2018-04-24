"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class MessageObjectCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], MessageObjectCreateRequest.prototype, "action_message_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], MessageObjectCreateRequest.prototype, "dataId", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], MessageObjectCreateRequest.prototype, "dataValue", void 0);
exports.MessageObjectCreateRequest = MessageObjectCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=MessageObjectCreateRequest.js.map