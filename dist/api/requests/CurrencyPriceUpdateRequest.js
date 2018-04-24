"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class CurrencyPriceUpdateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], CurrencyPriceUpdateRequest.prototype, "from", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], CurrencyPriceUpdateRequest.prototype, "to", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], CurrencyPriceUpdateRequest.prototype, "price", void 0);
exports.CurrencyPriceUpdateRequest = CurrencyPriceUpdateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=CurrencyPriceUpdateRequest.js.map