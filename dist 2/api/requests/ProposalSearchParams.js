"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const SearchOrder_1 = require("../enums/SearchOrder");
const ProposalType_1 = require("../enums/ProposalType");
// tslint:disable:variable-name
class ProposalSearchParams extends RequestBody_1.RequestBody {
    constructor() {
        super(...arguments);
        this.order = SearchOrder_1.SearchOrder.ASC;
    }
}
tslib_1.__decorate([
    class_validator_1.IsEnum(SearchOrder_1.SearchOrder),
    tslib_1.__metadata("design:type", String)
], ProposalSearchParams.prototype, "order", void 0);
tslib_1.__decorate([
    class_validator_1.IsEnum(ProposalType_1.ProposalType),
    tslib_1.__metadata("design:type", String)
], ProposalSearchParams.prototype, "type", void 0);
exports.ProposalSearchParams = ProposalSearchParams;
// tslint:enable:variable-name
//# sourceMappingURL=ProposalSearchParams.js.map