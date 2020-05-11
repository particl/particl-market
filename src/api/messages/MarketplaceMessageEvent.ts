// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { MarketplaceMessage } from './MarketplaceMessage';

export class MarketplaceMessageEvent {
    public smsgMessage: resources.SmsgMessage;
    public marketplaceMessage: MarketplaceMessage;
}
