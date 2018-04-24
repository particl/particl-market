"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const AddressType_1 = require("../enums/AddressType");
// tslint:disable:variable-name
class AddressCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], AddressCreateRequest.prototype, "profile_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressCreateRequest.prototype, "addressLine1", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressCreateRequest.prototype, "city", void 0);
tslib_1.__decorate([
    class_validator_1.IsDefined(),
    tslib_1.__metadata("design:type", String)
], AddressCreateRequest.prototype, "state", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressCreateRequest.prototype, "country", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressCreateRequest.prototype, "zipCode", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressCreateRequest.prototype, "type", void 0);
exports.AddressCreateRequest = AddressCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=AddressCreateRequest.js.map