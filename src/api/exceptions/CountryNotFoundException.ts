// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * CountryNotFoundException
 * ----------------------------------------
 *
 * This should be used if country
 * not found in country code conversion.
 */

import { Exception } from '../../core/api/Exception';


export class CountryNotFoundException extends Exception {
    constructor(country: string) {
        super(404, `Country ${country} was not found!`);
    }
}
