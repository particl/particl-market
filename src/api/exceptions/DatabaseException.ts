// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * DatabaseException
 * ----------------------------------------
 *
 * This should be used for repository errors like
 * entity with this id already exists and stuff like that.
 */

import { Exception } from '../../core/api/Exception';


export class DatabaseException extends Exception {
    constructor(text: string, error: any) {
        const value: string = error.stack.split('\n')[0];
        super(400, text, [
            value.substring(7)
        ]);
    }
}
