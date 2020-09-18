// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseSearchParams } from './BaseSearchParams';

export class ListingItemSearchParams extends BaseSearchParams {

    public market: string;
    public categories: string[] | number[];
    public seller: string;
    public minPrice: number;
    public maxPrice: number;
    public country: string;
    public shippingDestination: string;
    public searchString: string;
    public flagged: boolean;

    public listingItemHash: string;
    public withBids: boolean;
    public buyer: string;
    public msgid: string;

}
