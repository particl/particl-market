import * as _ from 'lodash';

export interface GenerateBidParamsInterface {
    generateListingItem: boolean;
    toParamsArray(): boolean[];
}

export class GenerateBidParams implements GenerateBidParamsInterface {

    public generateListingItemTemplate = true;
    public generateListingItem = true;
    public listingItemHash: string;
    public action: string;
    public bidder: string;
    public listingItemSeller: string;


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
    constructor(generateParams: any[] = []) {

        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateListingItemTemplate = generateParams[0] ? true : false;
            this.generateListingItem = generateParams[1] ? true : false;
            this.listingItemHash = generateParams[2] ? generateParams[2] : null;

            // if item hash was given, set generateListingItem to false
            this.generateListingItem = this.listingItemHash ? false : true;

            this.action = generateParams[3] ? generateParams[3] : null;
            this.bidder = generateParams[4] ? generateParams[4] : null;

            this.listingItemSeller = generateParams[5] ? generateParams[5] : null;
        }

    }

    public toParamsArray(): any[] {
        return [
            this.generateListingItemTemplate,
            this.generateListingItem,
            this.listingItemHash,
            this.action,
            this.bidder,
            this.listingItemSeller
        ];
    }

}
