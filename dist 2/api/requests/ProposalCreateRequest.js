"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const ProposalType_1 = require("../enums/ProposalType");
// tslint:disable:variable-name
class ProposalCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ProposalCreateRequest.prototype, "submitter", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ProposalCreateRequest.prototype, "blockStart", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ProposalCreateRequest.prototype, "blockEnd", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsEnum(ProposalType_1.ProposalType),
    tslib_1.__metadata("design:type", String)
], ProposalCreateRequest.prototype, "type", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ProposalCreateRequest.prototype, "title", void 0);
exports.ProposalCreateRequest = ProposalCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=ProposalCreateRequest.js.map