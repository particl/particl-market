// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';

/**
 * ActionProcessorInterface defines how the Processor classes for the different ActionMessages should be implemented
 */
export interface ActionProcessorInterface {

    /**
     * handle the event
     * @param event
     */
    onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus>;
}
