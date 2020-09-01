// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { MessageCreateParamsInterface } from './MessageCreateParamsInterface';

export interface ListingItemImageAddMessageCreateParams extends MessageCreateParamsInterface {
    listingItem: resources.ListingItem;
    image: resources.Image;
    signature: string;
    withData: boolean;  // whether the data is included in the message or not
                        // (... ProtocolDSN LOCAL or SMSG)
}

