// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ActionDirection } from '../enums/ActionDirection';

export interface ActionMessageValidatorInterface {

    /**
     * called before posting (BaseActionService.post) and after receiving (BaseActionMessageProcessor.process) the message
     * to make sure the message contents are valid
     *
     * @param marketplaceMessage
     * @param direction
     */
    validateMessage(marketplaceMessage: MarketplaceMessage, direction: ActionDirection): Promise<boolean>;

    /**
     * called after validateMessage and after receiving (BaseActionMessageProcessor.process) the message
     * to make sure the message sequence is valid
     *
     * @param marketplaceMessage
     * @param direction
     */
    validateSequence(marketplaceMessage: MarketplaceMessage, direction: ActionDirection): Promise<boolean>;
}
