// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';

export interface GenerateBidParamsInterface {
    generateListingItem: boolean;
    toParamsArray(): boolean[];
}

export class GenerateBidParams implements GenerateBidParamsInterface {

    public generateListingItemTemplate = true;
    public generateListingItem = true;
    public generateOrder = true;

    public listingItemId: number;
    public type: string;
    public bidder: string;
    public seller: string;
    public parentBidId: number;

    /**
     * generateParams[]:
     * [0]: generateListingItemTemplate, generate a ListingItemTemplate
     * [1]: generateListingItem, generate a ListingItem
     * [2]: generateOrder, generate an Order
     * [3]: listingItemId, attach bid to existing ListingItem
     * [4]: type, bid type, see MPAction
     * [5]: bidder, bidders address
     * [6]: seller, ListingItem sellers address
     * [7]: parentBidId, should be set if type !== MPA_BID
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {

        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateListingItemTemplate = !_.isNil(generateParams[0]) ? generateParams[0] : false;
            this.generateListingItem = !_.isNil(generateParams[1]) ? generateParams[1] : false;
            this.generateOrder = !_.isNil(generateParams[2]) ? generateParams[2] : false;

            this.listingItemId = generateParams[3] ? generateParams[3] : undefined;

            // if listingItemId was given, set generateListingItem to false
            this.generateListingItem = !this.listingItemId;

            this.type = generateParams[4] ? generateParams[4] : undefined;
            this.bidder = generateParams[5] ? generateParams[5] : undefined;
            this.seller = generateParams[6] ? generateParams[6] : undefined;
            this.parentBidId = generateParams[7] ? generateParams[7] : undefined;

        }
    }

    public toParamsArray(): any[] {
        return [
            this.generateListingItemTemplate,
            this.generateListingItem,
            this.generateOrder,
            this.listingItemId,
            this.type,
            this.bidder,
            this.seller,
            this.parentBidId
        ];
    }

}
