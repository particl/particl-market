// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseSearchParams } from './BaseSearchParams';

export class ListingItemTemplateSearchParams extends BaseSearchParams {

    public profileId?: number;
    public searchString?: string;
    public categories?: string[] | number[];
    public isBaseTemplate?: boolean;
    public marketReceiveAddress?: string;
    public hasListingItems?: boolean;

}
