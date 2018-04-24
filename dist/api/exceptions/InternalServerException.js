"use strict";
/**
 * InternalServerException
 * ----------------------------------------
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Exception_1 = require("../../core/api/Exception");
class InternalServerException extends Exception_1.Exception {
    constructor(...args) {
        super(500, args);
    }
}
exports.InternalServerException = InternalServerException;
//# sourceMappingURL=InternalServerException.js.map