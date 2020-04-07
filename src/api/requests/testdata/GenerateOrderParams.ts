// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';

export interface GenerateOrderParamsInterface {
    toParamsArray(): boolean[];
}

export class GenerateOrderParams implements GenerateOrderParamsInterface {

    public generateOrderItem = true;
    public bidderBidId: number;
    public sellerBidId: number;
    public bidderMarketId: string;
    public sellerMarketId: string;

    /**
     * generateParams[]:
     * [0]: generateOrderItem, generate OrderItem
     * [1]: bidderBidId, attach bidders Order to existing Bid
     * [2]: sellerBidId, attach sellers Order to existing Bid
     * [3]: bidderMarketId, bidders Market id
     * [4]: sellerMarketId, sellers Market id
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {

        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateOrderItem = generateParams[0] ? true : false;
            this.bidderBidId = generateParams[1] ? generateParams[1] : undefined;
            this.sellerBidId = generateParams[2] ? generateParams[2] : undefined;
            this.bidderMarketId = generateParams[3] ? generateParams[3] : undefined;
            this.sellerMarketId = generateParams[4] ? generateParams[4] : undefined;
        }
    }

    public toParamsArray(): any[] {
        return [
            this.generateOrderItem,
            this.bidderBidId,
            this.sellerBidId,
            this.bidderMarketId,
            this.sellerMarketId
        ];
    }

}
