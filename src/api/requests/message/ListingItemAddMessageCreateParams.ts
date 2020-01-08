// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { MessageCreateParamsInterface } from './MessageCreateParamsInterface';
import { CryptoAddress } from 'omp-lib/dist/interfaces/crypto';

export interface ListingItemAddMessageCreateParams extends MessageCreateParamsInterface {
    listingItem: resources.ListingItem | resources.ListingItemTemplate;
    seller: resources.Identity;
    cryptoAddress: CryptoAddress;
}

