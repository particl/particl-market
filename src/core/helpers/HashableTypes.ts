// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ListingItemCreateRequest } from '../../api/requests/ListingItemCreateRequest';
import { ListingItemTemplateCreateRequest } from '../../api/requests/ListingItemTemplateCreateRequest';

export type HashableTypes = resources.ListingItem | resources.ListingItemTemplate | ListingItemCreateRequest | ListingItemTemplateCreateRequest;
