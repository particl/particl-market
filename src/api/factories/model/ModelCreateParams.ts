import * as resources from 'resources';

export interface ModelCreateParams {
    //
}

export interface ListingItemCreateParams extends ModelCreateParams {
    marketId: number;
    rootCategory: resources.ItemCategory;
}

export interface BidCreateParams extends ModelCreateParams {
    listingItemId: number;
    bidder: string;
    latestBid?: resources.Bid;
}
