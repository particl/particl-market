"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
class ImagePostUploadRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsNumberString(),
    tslib_1.__metadata("design:type", Number)
], ImagePostUploadRequest.prototype, "listingItemTemplateId", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Object)
], ImagePostUploadRequest.prototype, "requestBody", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Object)
], ImagePostUploadRequest.prototype, "request", void 0);
exports.ImagePostUploadRequest = ImagePostUploadRequest;
//# sourceMappingURL=ImagePostUploadRequest.js.map