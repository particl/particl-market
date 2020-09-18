// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';

export interface GenerateOrderParamsInterface {
    toParamsArray(): boolean[];
}

export class GenerateOrderParams implements GenerateOrderParamsInterface {

    public generateOrderItem = true;
    public bidId: number;

    /**
     * generateParams[]:
     * [0]: generateOrderItem, generate OrderItem
     * [1]: bidId
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {
        if (!_.isEmpty(generateParams) ) {
            this.generateOrderItem = !_.isNil(generateParams[0]) ? generateParams[0] : false;
            this.bidId = !_.isNil(generateParams[1]) ? generateParams[1] : undefined;
        }
    }

    public toParamsArray(): any[] {
        return [
            this.generateOrderItem,
            this.bidId
        ];
    }
}
