// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.database.BluePrint
 * ------------------------------------------------
 */

import * as bookshelf from 'bookshelf';


export class BluePrint {
    constructor(
        public Model: typeof bookshelf.Model,
        public callback: (faker: Faker.FakerStatic, args: any[]) => any) { }
}
