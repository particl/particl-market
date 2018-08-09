// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.api.exceptionHandler
 * ------------------------------------------------
 *
 * This handler catches all thrown exceptions from the api layer. Afterwards it
 * send them directly to the client or otherwise it calls the next middleware.
 */

import { Environment } from '../helpers/Environment';
import { Exception, isException } from '../api/Exception';


export const exceptionHandler = (error: Exception | Error, req: myExpress.Request, res: myExpress.Response, next: myExpress.NextFunction) => {
    if (error instanceof Exception || error[isException]) {
        res.failed(error['code'], error.message, error['body'] || null);
        next();
    } else {
        if (Environment.isDevelopment() || Environment.isAlpha() || Environment.isTest()) {
            console.error(error.stack);
        }
        res.failed(500, 'Something broke!', error['body'] || null);
        next(error);
    }
};
