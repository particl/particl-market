// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionNotificationInterface } from './ActionNotificationInterface';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

export class ListingItemNotification implements ActionNotificationInterface {

    public type: MPAction.MPA_LISTING_ADD;
    public objectId: number;
    public objectHash: string;

    public from: string;    // was: seller
    public to: string;      // listing could be just a private offer to someone

    public market: string;

}
