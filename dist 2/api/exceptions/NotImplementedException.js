"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * NotImplementedException
 * ----------------------------------------
 *
 * This should be used when a feature is not implemented yet.
 */
const MessageException_1 = require("./MessageException");
class NotImplementedException extends MessageException_1.MessageException {
    constructor() {
        super('Not implemented.');
    }
}
exports.NotImplementedException = NotImplementedException;
//# sourceMappingURL=NotImplementedException.js.map