// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { MarketplaceMessageEvent } from '../messages/MarketplaceMessageEvent';
import { MessageProcessorInterface } from './MessageProcessorInterface';

export interface ActionMessageProcessorInterface extends MessageProcessorInterface {

    /**
     * handle the event
     * @param event
     */
    onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus>;
}
