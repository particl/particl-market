"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
// tslint:disable:variable-name
class SmsgMessageCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageCreateRequest.prototype, "type", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageCreateRequest.prototype, "status", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageCreateRequest.prototype, "msgid", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageCreateRequest.prototype, "version", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], SmsgMessageCreateRequest.prototype, "received", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], SmsgMessageCreateRequest.prototype, "sent", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], SmsgMessageCreateRequest.prototype, "expiration", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], SmsgMessageCreateRequest.prototype, "daysretention", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageCreateRequest.prototype, "from", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageCreateRequest.prototype, "to", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageCreateRequest.prototype, "text", void 0);
exports.SmsgMessageCreateRequest = SmsgMessageCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=SmsgMessageCreateRequest.js.map