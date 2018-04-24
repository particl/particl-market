"use strict";
/**
 * NotImplementedException
 * ----------------------------------------
 *
 * This should be used when a feature is not implemented yet.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const MessageException_1 = require("./MessageException");
class NotImplementedException extends MessageException_1.MessageException {
    constructor() {
        super('Not implemented.');
    }
}
exports.NotImplementedException = NotImplementedException;
//# sourceMappingURL=NotImplementedException.js.map