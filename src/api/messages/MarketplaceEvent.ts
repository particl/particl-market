// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from './MarketplaceMessage';
import * as resources from 'resources';

export class MarketplaceEvent {
    public smsgMessage: resources.SmsgMessage;
    public marketplaceMessage: MarketplaceMessage;
}
