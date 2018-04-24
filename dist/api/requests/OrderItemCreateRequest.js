"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const OrderStatus_1 = require("../enums/OrderStatus");
// tslint:disable:variable-name
class OrderItemCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], OrderItemCreateRequest.prototype, "itemHash", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], OrderItemCreateRequest.prototype, "bid_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsEnum(OrderStatus_1.OrderStatus),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], OrderItemCreateRequest.prototype, "status", void 0);
exports.OrderItemCreateRequest = OrderItemCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=OrderItemCreateRequest.js.map