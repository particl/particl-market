// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MessageCreateParamsInterface } from '../../requests/message/MessageCreateParamsInterface';
import { ActionMessageInterface } from '../../messages/action/ActionMessageInterface';

/**
 * MessageFactoryInterface defines how the Factory classes for the Messages should be implemented
 */
export interface MessageFactoryInterface {
    get(params: MessageCreateParamsInterface): Promise<ActionMessageInterface>;
}
