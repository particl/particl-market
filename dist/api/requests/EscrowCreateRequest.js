"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const EscrowType_1 = require("../enums/EscrowType");
// tslint:disable:variable-name
class EscrowCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], EscrowCreateRequest.prototype, "payment_information_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsEnum(EscrowType_1.EscrowType),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], EscrowCreateRequest.prototype, "type", void 0);
exports.EscrowCreateRequest = EscrowCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=EscrowCreateRequest.js.map