"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class ItemCategoryUpdateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ItemCategoryUpdateRequest.prototype, "parent_item_category_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], ItemCategoryUpdateRequest.prototype, "name", void 0);
exports.ItemCategoryUpdateRequest = ItemCategoryUpdateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=ItemCategoryUpdateRequest.js.map