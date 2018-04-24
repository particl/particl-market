"use strict";
/**
 * core.api.Exception
 * ------------------------------------------------
 *
 * We use this extend error for our custom errors, which we
 * call exceptions. They have a code property for the http-status,
 * global message and a body, which we will return as a json.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isException = Symbol();
class Exception extends Error {
    constructor(code, ...args) {
        super(args[0]);
        this.code = 500;
        this.code = code;
        this.name = this.constructor.name;
        this.message = args[0] || 'Unknown error';
        this.body = args[1] || args[0];
        this[exports.isException] = true;
        Error.captureStackTrace(this);
    }
    toString() {
        return `${this.code} - ${this.constructor.name}:${this.message}`;
    }
}
exports.Exception = Exception;
//# sourceMappingURL=Exception.js.map