"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const RequestBody_1 = require("../../../core/api/RequestBody");
/**
 * This class is used for update request. Create a new instance
 * with the json body and than call .validate() to check if
 * all criteria are given
 *
 * @export
 * @class UserUpdateRequest
 * @extends {RequestBody}
 */
class UserUpdateRequest extends RequestBody_1.RequestBody {
    /**
     * We override the validate method so we can skip the missing
     * properties.
     */
    validate() {
        return super.validate(true);
    }
}
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], UserUpdateRequest.prototype, "firstName", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], UserUpdateRequest.prototype, "lastName", void 0);
tslib_1.__decorate([
    class_validator_1.IsEmail(),
    tslib_1.__metadata("design:type", String)
], UserUpdateRequest.prototype, "email", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], UserUpdateRequest.prototype, "picture", void 0);
tslib_1.__decorate([
    class_validator_1.IsNotEmpty(),
    tslib_1.__metadata("design:type", String)
], UserUpdateRequest.prototype, "auth0UserId", void 0);
exports.UserUpdateRequest = UserUpdateRequest;
//# sourceMappingURL=UserUpdateRequest.js.map