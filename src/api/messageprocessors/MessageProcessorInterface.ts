// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { SmsgMessage } from '../messages/SmsgMessage';

export interface MessageProcessorInterface {
    process( message: ActionMessageInterface | ListingItemMessageInterface | SmsgMessage[], marketAddress: string): any;
}
