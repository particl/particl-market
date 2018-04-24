"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
// tslint:disable:variable-name
class ListingItemTemplatePostRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemTemplatePostRequest.prototype, "listingItemTemplateId", void 0);
exports.ListingItemTemplatePostRequest = ListingItemTemplatePostRequest;
// tslint:enable:variable-name
//# sourceMappingURL=ListingItemTemplatePostRequest.js.map