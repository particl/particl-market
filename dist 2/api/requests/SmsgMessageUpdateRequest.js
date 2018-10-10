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
class SmsgMessageUpdateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageUpdateRequest.prototype, "type", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageUpdateRequest.prototype, "status", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageUpdateRequest.prototype, "msgid", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageUpdateRequest.prototype, "version", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], SmsgMessageUpdateRequest.prototype, "received", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], SmsgMessageUpdateRequest.prototype, "sent", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], SmsgMessageUpdateRequest.prototype, "expiration", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], SmsgMessageUpdateRequest.prototype, "daysretention", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageUpdateRequest.prototype, "from", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], SmsgMessageUpdateRequest.prototype, "to", void 0);
exports.SmsgMessageUpdateRequest = SmsgMessageUpdateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=SmsgMessageUpdateRequest.js.map