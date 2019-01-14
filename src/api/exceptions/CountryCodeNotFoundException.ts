// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * CountryCodeNotFoundException
 * ----------------------------------------
 *
 * This should be used if country code
 * not found in country code conversion.
 */

import { Exception } from '../../core/api/Exception';


export class CountryCodeNotFoundException extends Exception {
    constructor(countryCode: string) {
        super(404, `Country code ${countryCode} was not found!`);
    }
}
