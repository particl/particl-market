// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { BidConfiguration } from 'omp-lib/dist/interfaces/configs';

export interface MessageCreateParams {
    //
}

export interface ListingItemAddMessageCreateParams extends MessageCreateParams {
    template: resources.ListingItemTemplate;
}

export interface BidMessageCreateParams extends MessageCreateParams {
    config: BidConfiguration;
    itemHash: string;                   // item hash to bid for
    generated?: number;                 // timestamp, when the bidder generated this bid
}

export interface BidAcceptMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to accept
}

export interface BidCancelMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to cancel
}

export interface BidRejectMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to reject
}

export interface EscrowMessageCreateParams extends MessageCreateParams {
    bidHash: string;                    // bid hash to reject
    memo?: string;
}

export interface ProposalAddMessageCreateParams extends MessageCreateParams {
    title: string;
    description: string;
    options: string[];
    sender: resources.Profile;
    itemHash?: string;
}

export interface VoteMessageCreateParams extends MessageCreateParams {
    proposalHash: string;
    proposalOptionHash: string;
    voter: string;
    signature: string;
}
