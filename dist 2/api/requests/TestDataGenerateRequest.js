"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const CreatableModel_1 = require("../enums/CreatableModel");
// tslint:disable:variable-name
class TestDataGenerateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], TestDataGenerateRequest.prototype, "model", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], TestDataGenerateRequest.prototype, "amount", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Boolean)
], TestDataGenerateRequest.prototype, "withRelated", void 0);
exports.TestDataGenerateRequest = TestDataGenerateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=TestDataGenerateRequest.js.map