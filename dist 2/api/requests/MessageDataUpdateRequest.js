"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class MessageDataUpdateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], MessageDataUpdateRequest.prototype, "msgid", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], MessageDataUpdateRequest.prototype, "version", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Date)
], MessageDataUpdateRequest.prototype, "received", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Date)
], MessageDataUpdateRequest.prototype, "sent", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], MessageDataUpdateRequest.prototype, "from", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], MessageDataUpdateRequest.prototype, "to", void 0);
exports.MessageDataUpdateRequest = MessageDataUpdateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=MessageDataUpdateRequest.js.map