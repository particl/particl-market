"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const SearchOrder_1 = require("../enums/SearchOrder");
// tslint:disable:variable-name
class ListingItemTemplateSearchParams extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemTemplateSearchParams.prototype, "page", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemTemplateSearchParams.prototype, "pageLimit", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsEnum(SearchOrder_1.SearchOrder),
    tslib_1.__metadata("design:type", String)
], ListingItemTemplateSearchParams.prototype, "order", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemTemplateSearchParams.prototype, "profileId", void 0);
exports.ListingItemTemplateSearchParams = ListingItemTemplateSearchParams;
// tslint:enable:variable-name
//# sourceMappingURL=ListingItemTemplateSearchParams.js.map