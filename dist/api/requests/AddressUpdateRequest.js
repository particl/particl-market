"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class AddressUpdateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressUpdateRequest.prototype, "firstName", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressUpdateRequest.prototype, "lastName", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressUpdateRequest.prototype, "addressLine1", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressUpdateRequest.prototype, "city", void 0);
tslib_1.__decorate([
    class_validator_1.IsDefined(),
    tslib_1.__metadata("design:type", String)
], AddressUpdateRequest.prototype, "state", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressUpdateRequest.prototype, "country", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], AddressUpdateRequest.prototype, "zipCode", void 0);
exports.AddressUpdateRequest = AddressUpdateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=AddressUpdateRequest.js.map