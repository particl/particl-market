// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MessageCreateParamsInterface } from './MessageCreateParamsInterface';

export interface BidCancelMessageCreateParams extends MessageCreateParamsInterface {
    bidHash: string;    // bid hash to cancel
}


