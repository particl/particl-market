"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class ProposalOptionCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ProposalOptionCreateRequest.prototype, "proposal_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ProposalOptionCreateRequest.prototype, "optionId", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ProposalOptionCreateRequest.prototype, "description", void 0);
exports.ProposalOptionCreateRequest = ProposalOptionCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=ProposalOptionCreateRequest.js.map