// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseSearchParams } from './BaseSearchParams';
import { MarketType } from '../../enums/MarketType';

export class MarketSearchParams extends BaseSearchParams {
    public searchString: string;
    public type: MarketType;
    public region: string;
}
