// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';

export interface GenerateOrderParamsInterface {
    generateListingItem: boolean;
    toParamsArray(): boolean[];
}

export class GenerateOrderParams implements GenerateOrderParamsInterface {

    public generateListingItemTemplate = true;
    public generateListingItem = true;
    public generateBid = true;
    public generateOrderItem = true;
    public listingItemHash: string;
    public bidId: number;
    public bidder: string;
    public listingItemSeller: string;

    /**
     * generateParams[]:
     * [0]: generateListingItemTemplate, generate a ListingItemTemplate
     * [1]: generateListingItem, generate a ListingItem
     * [2]: generateBid, generate a Bid
     * [3]: generateOrderItem, generate OrderItem
     * [4]: listingItemhash, attach bid to existing ListingItem
     * [5]: bidId, attach Order to existing Bid
     * [6]: bidder, bidders address
     * [7]: listingItemSeller, ListingItem sellers address
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {

        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateListingItemTemplate = generateParams[0] ? true : false;
            this.generateListingItem = generateParams[1] ? true : false;
            this.generateBid = generateParams[2] ? true : false;
            this.generateOrderItem = generateParams[3] ? true : false;

            this.listingItemHash = generateParams[4] ? generateParams[4] : null;
            this.bidId = generateParams[5] ? generateParams[5] : null;

            // if item hash was given, set generateListingItem to false
            this.generateListingItem = this.listingItemHash ? false : true;

            // if bid id was given, set generateListingItem to false and set generateBid to false
            this.generateListingItem = this.bidId ? false : true;
            this.generateBid = this.bidId ? false : true;

            // TODO: change, bidder is buyer in Order, so propably should be changed here
            this.bidder = generateParams[6] ? generateParams[6] : null;

            this.listingItemSeller = generateParams[7] ? generateParams[7] : null;
        }

    }

    public toParamsArray(): any[] {
        return [
            this.generateListingItemTemplate,
            this.generateListingItem,
            this.generateBid,
            this.generateOrderItem,
            this.listingItemHash,
            this.bidId,
            this.bidder,
            this.listingItemSeller
        ];
    }

}
