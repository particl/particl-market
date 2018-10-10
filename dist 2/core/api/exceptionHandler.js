"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * core.api.exceptionHandler
 * ------------------------------------------------
 *
 * This handler catches all thrown exceptions from the api layer. Afterwards it
 * send them directly to the client or otherwise it calls the next middleware.
 */
const Environment_1 = require("../helpers/Environment");
const Exception_1 = require("../api/Exception");
exports.exceptionHandler = (error, req, res, next) => {
    if (error instanceof Exception_1.Exception || error[Exception_1.isException]) {
        res.failed(error['code'], error.message, error['body'] || null);
        next();
    }
    else {
        if (Environment_1.Environment.isDevelopment() || Environment_1.Environment.isAlpha() || Environment_1.Environment.isTest()) {
            console.error(error.stack);
        }
        res.failed(500, 'Something broke!', error['body'] || null);
        next(error);
    }
};
//# sourceMappingURL=exceptionHandler.js.map