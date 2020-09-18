// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionNotificationInterface } from './ActionNotificationInterface';

export class ListingItemNotification implements ActionNotificationInterface {

    public id: number;
    public hash: string;

    public seller: string;
    public market: string;

}
