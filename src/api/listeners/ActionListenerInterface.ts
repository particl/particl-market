// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { MarketplaceMessageEvent } from '../messages/MarketplaceMessageEvent';

/**
 * ActionListenerInterface defines how the Listener classes for the different ActionMessages should be implemented
 */
export interface ActionListenerInterface {

    /**
     * handle the event
     * @param event
     */
    onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus>;
}
