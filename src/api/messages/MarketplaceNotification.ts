// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionNotificationInterface } from './notification/ActionNotificationInterface';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';

export class MarketplaceNotification {
    public event: ActionMessageTypes;
    public payload: ActionNotificationInterface;
}
