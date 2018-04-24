"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../core/api/RequestBody");
const CreatableModel_1 = require("../enums/CreatableModel");
// tslint:disable:variable-name
class TestDataCreateRequest extends RequestBody_1.RequestBody {
    constructor() {
        super(...arguments);
        this.timestampedHash = false;
    }
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], TestDataCreateRequest.prototype, "model", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", Object)
], TestDataCreateRequest.prototype, "data", void 0);
exports.TestDataCreateRequest = TestDataCreateRequest;
// tslint:enable:variable-name
//# sourceMappingURL=TestDataCreateRequest.js.map