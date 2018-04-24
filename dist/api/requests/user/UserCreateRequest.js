"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../../core/api/RequestBody");
/**
 * This class is used for create request. Create a new instance
 * with the json body and than call .validate() to check if
 * all criteria are given
 *
 * @export
 * @class UserCreateRequest
 * @extends {RequestBody}
 */
class UserCreateRequest extends RequestBody_1.RequestBody {
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], UserCreateRequest.prototype, "firstName", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], UserCreateRequest.prototype, "lastName", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsEmail(),
    tslib_1.__metadata("design:type", String)
], UserCreateRequest.prototype, "email", void 0);
exports.UserCreateRequest = UserCreateRequest;
//# sourceMappingURL=UserCreateRequest.js.map