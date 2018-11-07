// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * ModelNotFoundException
 * ----------------------------------------
 *
 * This should be used if a someone requests a
 * entity with a name and it's not found.
 */

import { Exception } from '../../core/api/Exception';


export class ModelNotFoundException extends Exception {
    constructor(name: string) {
        super(404, `${name} not found.`);
    }
}
