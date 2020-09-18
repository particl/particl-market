// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MissingParamException
 * ----------------------------------------
 *
 *
 * This should be used if the command that
 * was called is missing a parameter.
 */

import { Exception } from '../../core/api/Exception';


export class MissingParamException extends Exception {
    constructor(param: string) {
        super(404, `Missing ${param}.`);
    }
}
