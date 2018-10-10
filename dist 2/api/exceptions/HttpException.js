"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * HttpException
 * ----------------------------------------
 *
 */
const Exception_1 = require("../../core/api/Exception");
class HttpException extends Exception_1.Exception {
    constructor(id, message) {
        super(id, message);
    }
}
exports.HttpException = HttpException;
//# sourceMappingURL=HttpException.js.map