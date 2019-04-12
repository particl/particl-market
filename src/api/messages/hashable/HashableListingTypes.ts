// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ListingItemCreateRequest } from '../../requests/ListingItemCreateRequest';
import { ListingItemTemplateCreateRequest } from '../../requests/ListingItemTemplateCreateRequest';

export type HashableListingTypes = resources.ListingItem | resources.ListingItemTemplate | ListingItemCreateRequest | ListingItemTemplateCreateRequest;
