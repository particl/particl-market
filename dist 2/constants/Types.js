"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * constants.Types
 * ------------------------------------------------
 *
 * We extend the TYPE variable of the 'inversify-express-utils'
 * module with our service and repositories.
 */
const inversify_express_utils_1 = require("inversify-express-utils");
exports.Types = Object.assign({}, inversify_express_utils_1.TYPE, { Lib: Symbol('Lib'), Core: Symbol('Core'), Model: Symbol('Model'), Service: Symbol('Service'), Command: Symbol('Command'), Factory: Symbol('Factory'), MessageProcessor: Symbol('MessageProcessor'), Listener: Symbol('Listener'), Repository: Symbol('Repository'), Middleware: Symbol('Middleware') });
//# sourceMappingURL=Types.js.map