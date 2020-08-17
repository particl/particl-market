// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageInterface } from '../../messages/action/ActionMessageInterface';
import { ActionRequestInterface } from '../../requests/action/ActionRequestInterface';

/**
 * MessageFactoryInterface defines how the Factory classes for the Messages should be implemented
 */
export interface MessageFactoryInterface {
    get(params: ActionRequestInterface): Promise<ActionMessageInterface>;
}
