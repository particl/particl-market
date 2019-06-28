// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * HashMismatchException
 * ----------------------------------------
 *
 */

import { Exception } from '../../core/api/Exception';


export class HashMismatchException extends Exception {
    constructor(param: string, expecting?: string, got?: string) {
        super(404, 'Hash mismatch for ' + param + '. ' + expecting ? ' Expecting: ' + expecting + ', but got: ' + got + '.' : '');
    }
}
