"use strict";
/**
 * HttpException
 * ----------------------------------------
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Exception_1 = require("../../core/api/Exception");
class HttpException extends Exception_1.Exception {
    constructor(id, message) {
        super(id, message);
    }
}
exports.HttpException = HttpException;
//# sourceMappingURL=HttpException.js.map