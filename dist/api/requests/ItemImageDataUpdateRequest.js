"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const ImageDataProtocolType_1 = require("../enums/ImageDataProtocolType");
// tslint:disable:variable-name
class ItemImageDataUpdateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ItemImageDataUpdateRequest.prototype, "item_image_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsEnum(ImageDataProtocolType_1.ImageDataProtocolType),
    tslib_1.__metadata("design:type", String)
], ItemImageDataUpdateRequest.prototype, "protocol", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ItemImageDataUpdateRequest.prototype, "imageVersion", void 0);
exports.ItemImageDataUpdateRequest = ItemImageDataUpdateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=ItemImageDataUpdateRequest.js.map