"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class OrderItemObjectCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], OrderItemObjectCreateRequest.prototype, "order_item_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], OrderItemObjectCreateRequest.prototype, "dataId", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], OrderItemObjectCreateRequest.prototype, "dataValue", void 0);
exports.OrderItemObjectCreateRequest = OrderItemObjectCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=OrderItemObjectCreateRequest.js.map