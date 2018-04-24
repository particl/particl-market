export interface GenerateBidParamsInterface {
    generateListingItem: boolean;
    toParamsArray(): boolean[];
}
export declare class GenerateBidParams implements GenerateBidParamsInterface {
    generateListingItemTemplate: boolean;
    generateListingItem: boolean;
    listingItemHash: string;
    action: string;
    bidder: string;
    listingItemSeller: string;
    /**
     * generateParams[]:
     * [0]: generateListingItemTemplate, generate a ListingItemTemplate
     * [1]: generateListingItem, generate a ListingItem
     * [2]: listingItemhash, attach bid to existing ListingItem
     * [3]: action, bid action, see BidMessageType
     * [4]: bidder, bidders address
     * [5]: listingItemSeller, ListingItem sellers address
     *
     * @param generateParams
     */
    constructor(generateParams?: any[]);
    toParamsArray(): any[];
}
