// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { BlacklistType } from '../../enums/BlacklistType';

export interface GenerateBlacklistParamsInterface {
    type: BlacklistType;
    toParamsArray(): any[];
}

export class GenerateBlacklistParams implements GenerateBlacklistParamsInterface {

    public type = BlacklistType.LISTINGITEM;

    /**
     * generateParams[]:
     * [0]: generateType
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.type = generateParams[0] ? generateParams[0] : undefined;
        }
    }

    public toParamsArray(): any[] {
        return [this.type];
    }

}
