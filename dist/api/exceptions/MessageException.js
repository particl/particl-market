"use strict";
/**
 * MessageException
 * ----------------------------------------
 *
 * This should be used if a someone requests a
 * entity with a id, but there is no entity with this id in the
 * database, then we throw this exception.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Exception_1 = require("../../core/api/Exception");
class MessageException extends Exception_1.Exception {
    constructor(message) {
        super(404, `${message}`);
    }
}
exports.MessageException = MessageException;
//# sourceMappingURL=MessageException.js.map