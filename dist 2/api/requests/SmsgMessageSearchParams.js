"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const SearchOrder_1 = require("../enums/SearchOrder");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
// tslint:disable:variable-name
class SmsgMessageSearchParams extends RequestBody_1.RequestBody {
    constructor() {
        super(...arguments);
        this.order = SearchOrder_1.SearchOrder.DESC;
        this.orderByColumn = 'received';
        this.page = 0;
        this.pageLimit = 10;
        this.age = 1000 * 60 * 2; // minimum message age in ms, 2 min
    }
}
tslib_1.__decorate([
    class_validator_1.IsEnum(SearchOrder_1.SearchOrder),
    tslib_1.__metadata("design:type", String)
], SmsgMessageSearchParams.prototype, "order", void 0);
tslib_1.__decorate([
    class_validator_1.IsEnum(SmsgMessageStatus_1.SmsgMessageStatus),
    tslib_1.__metadata("design:type", String)
], SmsgMessageSearchParams.prototype, "status", void 0);
exports.SmsgMessageSearchParams = SmsgMessageSearchParams;
// tslint:enable:variable-name
//# sourceMappingURL=SmsgMessageSearchParams.js.map