// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ActionMessageInterface } from '../messages/action/ActionMessageInterface';
import { CoreSmsgMessage } from '../messages/CoreSmsgMessage';
import { MarketplaceMessageEvent } from '../messages/MarketplaceMessageEvent';

export type ProcessableMessages = MarketplaceMessageEvent
                                | ActionMessageInterface
                                | CoreSmsgMessage[]
                                | resources.SmsgMessage[]
                                | string;
