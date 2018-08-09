// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { SmsgMessage } from './SmsgMessage';
import { MarketplaceMessage } from './MarketplaceMessage';

export class MarketplaceEvent {
    public smsgMessage: SmsgMessage;
    public marketplaceMessage: MarketplaceMessage;
}
