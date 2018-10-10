"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * InternalServerException
 * ----------------------------------------
 *
 */
const Exception_1 = require("../../core/api/Exception");
class InternalServerException extends Exception_1.Exception {
    constructor(...args) {
        super(500, args);
    }
}
exports.InternalServerException = InternalServerException;
//# sourceMappingURL=InternalServerException.js.map