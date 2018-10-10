"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * SmsgMessageStatus
 *
 */
var SmsgMessageStatus;
(function (SmsgMessageStatus) {
    SmsgMessageStatus["NEW"] = "NEW";
    SmsgMessageStatus["PARSING_FAILED"] = "PARSING_FAILED";
    SmsgMessageStatus["PROCESSING"] = "PROCESSING";
    SmsgMessageStatus["PROCESSED"] = "PROCESSED";
    SmsgMessageStatus["PROCESSING_FAILED"] = "PROCESSING_FAILED";
    SmsgMessageStatus["WAITING"] = "WAITING";
    SmsgMessageStatus["DB_LOCKED"] = "DB_LOCKED"; // db was locked, retry asap TODO: get rid of this
})(SmsgMessageStatus = exports.SmsgMessageStatus || (exports.SmsgMessageStatus = {}));
//# sourceMappingURL=SmsgMessageStatus.js.map