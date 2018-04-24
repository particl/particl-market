"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const Currency_1 = require("../enums/Currency");
// tslint:disable:variable-name
class ItemPriceCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ItemPriceCreateRequest.prototype, "payment_information_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsEnum(Currency_1.Currency),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ItemPriceCreateRequest.prototype, "currency", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ItemPriceCreateRequest.prototype, "basePrice", void 0);
exports.ItemPriceCreateRequest = ItemPriceCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=ItemPriceCreateRequest.js.map