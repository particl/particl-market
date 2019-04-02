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

export interface ProposalCreateParams extends ModelCreateParams {
}

export interface VoteCreateParams extends ModelCreateParams {
    proposalOption: resources.ProposalOption;
    weight: number;
    create: boolean;
}

