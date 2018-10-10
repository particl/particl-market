"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MessageException
 * ----------------------------------------
 *
 * This should be used if a someone requests a
 * entity with a id, but there is no entity with this id in the
 * database, then we throw this exception.
 */
const Exception_1 = require("../../core/api/Exception");
class ModelNotFoundException extends Exception_1.Exception {
    constructor(name) {
        super(404, `Model with identifier ${name} does not exist`);
    }
}
exports.ModelNotFoundException = ModelNotFoundException;
//# sourceMappingURL=ModelNotFoundException.js.map