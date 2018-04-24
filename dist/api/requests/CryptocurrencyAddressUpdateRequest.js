"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const CryptocurrencyAddressType_1 = require("../enums/CryptocurrencyAddressType");
// tslint:disable:variable-name
class CryptocurrencyAddressUpdateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsEnum(CryptocurrencyAddressType_1.CryptocurrencyAddressType),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], CryptocurrencyAddressUpdateRequest.prototype, "type", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], CryptocurrencyAddressUpdateRequest.prototype, "address", void 0);
exports.CryptocurrencyAddressUpdateRequest = CryptocurrencyAddressUpdateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=CryptocurrencyAddressUpdateRequest.js.map