// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageInterface } from '../messages/actions/ActionMessageInterface';
import { IncomingSmsgMessage } from '../messages/IncomingSmsgMessage';
import * as resources from 'resources';

export type ProcessableMessages = ActionMessageInterface
                                // | ListingItemMessageInterface
                                | IncomingSmsgMessage[]
                                | resources.SmsgMessage[];
