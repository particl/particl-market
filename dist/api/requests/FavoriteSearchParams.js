"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class FavoriteSearchParams extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Object)
], FavoriteSearchParams.prototype, "profileId", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Object)
], FavoriteSearchParams.prototype, "itemId", void 0);
exports.FavoriteSearchParams = FavoriteSearchParams;
// tslint:enable:variable-name
//# sourceMappingURL=FavoriteSearchParams.js.map