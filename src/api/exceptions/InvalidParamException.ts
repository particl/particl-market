// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * InvalidParamException
 * ----------------------------------------
 *
 *
 * This should be used if the command that
 * was called has invalid parameter
 */

import { Exception } from '../../core/api/Exception';


export class InvalidParamException extends Exception {
    constructor(param: string) {
        super(404, `Invalid ${param}.`);
    }
}
