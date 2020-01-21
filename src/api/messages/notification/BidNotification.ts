// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionNotificationInterface } from './ActionNotificationInterface';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

export class BidNotification implements ActionNotificationInterface {

    public type: MPAction.MPA_BID;
    public id: number;
    public hash: string;

    public bidder: string;
    public listingItemHash: string;
    public market: string;

}
