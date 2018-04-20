import * as _ from 'lodash';

export interface GenerateOrderParamsInterface {
    generateListingItem: boolean;
    toParamsArray(): boolean[];
}

export class GenerateOrderParams implements GenerateOrderParamsInterface {

    public generateListingItemTemplate = true;
    public generateListingItem = true;
    public generateBid = true;
    public listingItemHash: string;
    public bidId: number;
    public bidder: string;
    public listingItemSeller: string;

    /**
     * generateParams[]:
     * [0]: generateListingItemTemplate, generate a ListingItemTemplate
     * [1]: generateListingItem, generate a ListingItem
     * [2]: generateBid, generate a Bid
     * [3]: listingItemhash, attach bid to existing ListingItem
     * [4]: bidId, attach Order to existing Bid
     * [5]: bidder, bidders address
     * [6]: listingItemSeller, ListingItem sellers address
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {

        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateListingItemTemplate = generateParams[0] ? true : false;
            this.generateListingItem = generateParams[1] ? true : false;
            this.generateBid = generateParams[2] ? true : false;

            this.listingItemHash = generateParams[3] ? generateParams[3] : null;
            this.bidId = generateParams[4] ? generateParams[4] : null;

            // if item hash was given, set generateListingItem to false
            this.generateListingItem = this.listingItemHash ? false : true;

            // if bid id was given, set generateListingItem to false and set generateBid to false
            this.generateListingItem = this.bidId ? false : true;
            this.generateBid = this.bidId ? false : true;

            // TODO: change, bidder is buyer in Order, so propably should be changed here
            this.bidder = generateParams[5] ? generateParams[5] : null;

            this.listingItemSeller = generateParams[6] ? generateParams[6] : null;
        }

    }

    public toParamsArray(): any[] {
        return [
            this.generateListingItemTemplate,
            this.generateListingItem,
            this.generateBid,
            this.listingItemHash,
            this.bidId,
            this.bidder,
            this.listingItemSeller
        ];
    }

}
