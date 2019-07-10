// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MessageCreateParamsInterface } from './MessageCreateParamsInterface';

export interface OrderItemShipMessageCreateParams extends MessageCreateParamsInterface {
    bidHash: string;    // bid hash to reject
    memo?: string;
}


