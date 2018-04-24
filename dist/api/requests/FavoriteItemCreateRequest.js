"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class FavoriteItemCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], FavoriteItemCreateRequest.prototype, "profile_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], FavoriteItemCreateRequest.prototype, "listing_item_id", void 0);
exports.FavoriteItemCreateRequest = FavoriteItemCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=FavoriteItemCreateRequest.js.map