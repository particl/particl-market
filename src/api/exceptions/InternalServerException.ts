// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * InternalServerException
 * ----------------------------------------
 *
 */

import { Exception } from '../../core/api/Exception';


export class InternalServerException extends Exception {
    constructor(...args: any[]) {
        super(500, args);
    }
}
