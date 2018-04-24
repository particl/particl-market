"use strict";
/**
 * core.api.RequestBody
 * ------------------------------------------------
 *
 * This class is used to verify a valid payload an prepare
 * it for further actions in the services. To validate we
 * use the module 'class-validator'.
 *
 * If you want to skip missing properties just override the
 * validate method in your extended request class.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const class_validator_1 = require("class-validator");
const ValidationException_1 = require("../../api/exceptions/ValidationException");
class RequestBody {
    /**
     * Creates an instance of RequestBody and if a input is given
     * we store the values into the correct property
     */
    constructor(input) {
        if (input) {
            const keys = Object.keys(input);
            keys.forEach((key) => {
                this[key] = input[key];
            });
        }
    }
    /**
     * Validates the body on the basis of the validator-annotations
     */
    validate(skipMissingProperties = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const errors = yield class_validator_1.validate(this, { skipMissingProperties });
            if (errors && errors.length > 0) {
                throw new ValidationException_1.ValidationException('Request body is not valid', errors);
            }
            return;
        });
    }
}
exports.RequestBody = RequestBody;
//# sourceMappingURL=RequestBody.js.map