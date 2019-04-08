// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ActionDirection } from '../../enums/ActionDirection';

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

export interface SmsgMessageCreateParams extends ModelCreateParams {
    direction: ActionDirection;
    target?: string;
}
