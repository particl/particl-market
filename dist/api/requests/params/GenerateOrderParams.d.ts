export interface GenerateOrderParamsInterface {
    generateListingItem: boolean;
    toParamsArray(): boolean[];
}
export declare class GenerateOrderParams implements GenerateOrderParamsInterface {
    generateListingItemTemplate: boolean;
    generateListingItem: boolean;
    generateBid: boolean;
    listingItemHash: string;
    bidId: number;
    bidder: string;
    listingItemSeller: string;
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
    constructor(generateParams?: any[]);
    toParamsArray(): any[];
}
