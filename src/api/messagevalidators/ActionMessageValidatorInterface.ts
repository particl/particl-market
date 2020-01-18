// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ActionDirection } from '../enums/ActionDirection';

export interface ActionMessageValidatorInterface {

    validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean>;
    validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean>;
}
