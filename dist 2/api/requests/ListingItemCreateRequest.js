"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class ListingItemCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ListingItemCreateRequest.prototype, "seller", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemCreateRequest.prototype, "market_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemCreateRequest.prototype, "expiryTime", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemCreateRequest.prototype, "postedAt", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemCreateRequest.prototype, "expiredAt", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemCreateRequest.prototype, "receivedAt", void 0);
exports.ListingItemCreateRequest = ListingItemCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=ListingItemCreateRequest.js.map