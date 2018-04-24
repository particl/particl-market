"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class PriceTickerCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], PriceTickerCreateRequest.prototype, "crypto_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], PriceTickerCreateRequest.prototype, "crypto_name", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], PriceTickerCreateRequest.prototype, "crypto_symbol", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], PriceTickerCreateRequest.prototype, "crypto_rank", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], PriceTickerCreateRequest.prototype, "crypto_price_usd", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], PriceTickerCreateRequest.prototype, "crypto_price_btc", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], PriceTickerCreateRequest.prototype, "crypto_price_eur", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], PriceTickerCreateRequest.prototype, "crypto_24h_volume_eur", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], PriceTickerCreateRequest.prototype, "crypto_market_cap_eur", void 0);
exports.PriceTickerCreateRequest = PriceTickerCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=PriceTickerCreateRequest.js.map