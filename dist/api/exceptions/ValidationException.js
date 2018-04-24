"use strict";
/**
 * ValidationException
 * ----------------------------------------
 *
 * This should be used when we validate
 * the request payload, so we can response with a 400 (Bad Request)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Exception_1 = require("../../core/api/Exception");
class ValidationException extends Exception_1.Exception {
    constructor(text, errors) {
        const info = errors.map((e) => ({
            property: e.property,
            constraints: e.constraints
        }));
        super(400, text, info);
    }
}
exports.ValidationException = ValidationException;
//# sourceMappingURL=ValidationException.js.map