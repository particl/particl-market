"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class ShippingPriceCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ShippingPriceCreateRequest.prototype, "item_price_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ShippingPriceCreateRequest.prototype, "domestic", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ShippingPriceCreateRequest.prototype, "international", void 0);
exports.ShippingPriceCreateRequest = ShippingPriceCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=ShippingPriceCreateRequest.js.map