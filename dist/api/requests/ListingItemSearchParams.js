"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const SearchOrder_1 = require("../enums/SearchOrder");
const ListingItemSearchType_1 = require("../enums/ListingItemSearchType");
const _ = require("lodash");
// tslint:disable:variable-name
class ListingItemSearchParams extends RequestBody_1.RequestBody {
    /*
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: category, number|string, if string, try to find using key, can be null
     *  [4]: type (FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL)
     *  [5]: profileId, (NUMBER | OWN | ALL | *)
     *  [6]: minPrice, number to search item basePrice between 2 range
     *  [7]: maxPrice, number to search item basePrice between 2 range
     *  [8]: country, string, can be null
     *  [9]: shippingDestination, string, can be null
     *  [10]: searchString, string, can be null
     *  [11]: withRelated, boolean
 */
    constructor(generateParams = []) {
        super(generateParams);
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams)) {
            this.page = generateParams[0] ? generateParams[0] : 1;
            this.pageLimit = generateParams[1] ? generateParams[1] : 10;
            this.order = generateParams[2] ? generateParams[2] : SearchOrder_1.SearchOrder.ASC;
            this.category = generateParams[3] ? generateParams[3] : '';
            this.type = generateParams[4] ? generateParams[4] : 'ALL';
            this.profileId = generateParams[5] ? generateParams[4] : 'ALL';
            this.minPrice = generateParams[6] ? generateParams[6] : null;
            this.maxPrice = generateParams[7] ? generateParams[7] : null;
            this.country = generateParams[8] ? generateParams[8] : '';
            this.shippingDestination = generateParams[9] ? generateParams[9] : '';
            this.searchString = generateParams[10] ? generateParams[10] : '';
            this.withRelated = generateParams[11] ? generateParams[11] : true;
        }
    }
    toParamsArray() {
        return [
            this.page,
            this.pageLimit,
            this.order,
            this.category,
            this.type,
            this.profileId,
            this.minPrice,
            this.maxPrice,
            this.country,
            this.shippingDestination,
            this.searchString,
            this.withRelated
        ];
    }
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemSearchParams.prototype, "page", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], ListingItemSearchParams.prototype, "pageLimit", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsEnum(SearchOrder_1.SearchOrder),
    tslib_1.__metadata("design:type", String)
], ListingItemSearchParams.prototype, "order", void 0);
tslib_1.__decorate([
    class_validator_1.ValidateIf(o => o.type),
    class_validator_1.IsEnum(ListingItemSearchType_1.ListingItemSearchType),
    tslib_1.__metadata("design:type", String)
], ListingItemSearchParams.prototype, "type", void 0);
exports.ListingItemSearchParams = ListingItemSearchParams;
// tslint:enable:variable-name
//# sourceMappingURL=ListingItemSearchParams.js.map