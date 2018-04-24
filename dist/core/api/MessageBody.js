"use strict";
/**
 * core.api.MessageBody
 * ------------------------------------------------
 *
 * This class is used to verify a valid payload and prepare
 * it for further actions in the services. To validate we
 * use the module 'class-validator'.
 *
 * If you want to skip missing properties just override the
 * validate method in your extended request class.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const RequestBody_1 = require("./RequestBody");
const class_validator_1 = require("class-validator");
const ValidationException_1 = require("../../api/exceptions/ValidationException");
class MessageBody extends RequestBody_1.RequestBody {
    /**
     * Validates the body on the basis of the validator-annotations
     */
    validate(skipMissingProperties = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const errors = yield class_validator_1.validate(this, { skipMissingProperties });
            if (errors && errors.length > 0) {
                throw new ValidationException_1.ValidationException('Message body is not valid', errors);
            }
            return;
        });
    }
}
exports.MessageBody = MessageBody;
//# sourceMappingURL=MessageBody.js.map