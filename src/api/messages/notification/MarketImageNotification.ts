// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionNotificationInterface } from './ActionNotificationInterface';
import { MPActionExtended } from '../../enums/MPActionExtended';

export class MarketImageNotification implements ActionNotificationInterface {

    public type: MPActionExtended.MPA_MARKET_IMAGE_ADD;
    public objectId: number;
    public objectHash: string;

    public target: string;          // was: marketHash
}
