// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageItemInterface } from './ActionMessageItemInterface';
import { ListingItemMessageInterface } from './ListingItemMessageInterface';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MPA, MPM } from 'omp-lib/dist/interfaces/omp';

export class MarketplaceMessage { // implements MPM {
    public version: string;
    // public action: MPA;

    // TODO: these should be removed with new omp-lib
    public mpaction?: ActionMessageItemInterface | ActionMessageInterface;
    public item?: ListingItemMessageInterface;

}
