"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class ItemImageDataCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ItemImageDataCreateRequest.prototype, "protocol", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ItemImageDataCreateRequest.prototype, "imageVersion", void 0);
exports.ItemImageDataCreateRequest = ItemImageDataCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=ItemImageDataCreateRequest.js.map