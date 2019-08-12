// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * constants.Types
 * ------------------------------------------------
 *
 * We extend the TYPE variable of the 'inversify-express-utils'
 * module with our service and repositories.
 */

import { TYPE } from 'inversify-express-utils';

export const Types = {
    ...TYPE,
    Lib: Symbol('Lib'),
    Core: Symbol('Core'),
    Model: Symbol('Model'),
    Service: Symbol('Service'),
    Command: Symbol('Command'),
    Factory: Symbol('Factory'),
    MessageProcessor: Symbol('MessageProcessor'),
    Listener: Symbol('Listener'),
    Repository: Symbol('Repository'),
    Middleware: Symbol('Middleware')
};
