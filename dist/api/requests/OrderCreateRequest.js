"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const AddressCreateRequest_1 = require("./AddressCreateRequest");
// tslint:disable:variable-name
class OrderCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", AddressCreateRequest_1.AddressCreateRequest)
], OrderCreateRequest.prototype, "address", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], OrderCreateRequest.prototype, "hash", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], OrderCreateRequest.prototype, "buyer", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], OrderCreateRequest.prototype, "seller", void 0);
exports.OrderCreateRequest = OrderCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=OrderCreateRequest.js.map