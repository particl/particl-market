// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageItemInterface } from './ActionMessageItemInterface';
import { ListingItemMessageInterface } from './ListingItemMessageInterface';
import { ActionMessageInterface } from './ActionMessageInterface';

export class MarketplaceMessage {
    public version: string;
    public mpaction?: ActionMessageItemInterface | ActionMessageInterface;
    public item?: ListingItemMessageInterface;

}
