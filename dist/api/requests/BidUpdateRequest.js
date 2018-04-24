"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const BidMessageType_1 = require("../enums/BidMessageType");
// tslint:disable:variable-name
class BidUpdateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Number)
], BidUpdateRequest.prototype, "listing_item_id", void 0);
tslib_1.__decorate([
    class_validator_1.IsEnum(BidMessageType_1.BidMessageType),
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], BidUpdateRequest.prototype, "action", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], BidUpdateRequest.prototype, "bidder", void 0);
exports.BidUpdateRequest = BidUpdateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=BidUpdateRequest.js.map