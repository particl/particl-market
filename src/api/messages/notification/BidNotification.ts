// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionNotificationInterface } from './ActionNotificationInterface';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MPActionExtended } from '../../enums/MPActionExtended';

export type BidActionMessageTypes = MPAction.MPA_BID | MPAction.MPA_ACCEPT
    | MPAction.MPA_REJECT | MPAction.MPA_LOCK | MPAction.MPA_CANCEL
    | MPActionExtended.MPA_COMPLETE | MPActionExtended.MPA_REFUND
    | MPActionExtended.MPA_RELEASE | MPActionExtended.MPA_SHIP;

export class BidNotification implements ActionNotificationInterface {
    public objectId: number;
    public objectHash: string;

    public from: string;        // was: bidder
    public to: string;

    public target: string;      // was: listingItemHash
    public market: string;
}
