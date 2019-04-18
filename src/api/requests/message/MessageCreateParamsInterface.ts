// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BidConfiguration } from 'omp-lib/dist/interfaces/configs';

export interface MessageCreateParamsInterface {
    //
}


export interface BidMessageCreateParamsDEPRECATED extends MessageCreateParamsInterface {
    config: BidConfiguration;
    itemHash: string;                   // item hash to bid for
    generated?: number;                 // timestamp, when the bidder generated this bid
}

export interface BidAcceptMessageCreateParamsDEPRECATED extends MessageCreateParamsInterface {
    bidHash: string;                    // bid hash to accept
}

export interface BidCancelMessageCreateParamsDEPRECATED extends MessageCreateParamsInterface {
    bidHash: string;                    // bid hash to cancel
}

export interface BidRejectMessageCreateParamsDEPRECATED extends MessageCreateParamsInterface {
    bidHash: string;                    // bid hash to reject
}


