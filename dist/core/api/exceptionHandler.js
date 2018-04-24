"use strict";
/**
 * core.api.exceptionHandler
 * ------------------------------------------------
 *
 * This handler catches all thrown exceptions from the api layer. Afterwards it
 * send them directly to the client or otherwise it calls the next middleware.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Environment_1 = require("../helpers/Environment");
const Exception_1 = require("../api/Exception");
exports.exceptionHandler = (error, req, res, next) => {
    if (error instanceof Exception_1.Exception || error[Exception_1.isException]) {
        res.failed(error['code'], error.message, error['body'] || null);
        next();
    }
    else {
        if (Environment_1.Environment.isDevelopment()) {
            console.error(error.stack);
        }
        res.failed(500, 'Something broke!', error['body'] || null);
        next(error);
    }
};
//# sourceMappingURL=exceptionHandler.js.map