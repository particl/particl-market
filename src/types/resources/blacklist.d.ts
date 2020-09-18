// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface Blacklist {
        id: number;
        type: string;
        target: string;         // target listing/market/image/...
        market: string;         // optional market to be blacklisted on

        ListingItem: ListingItem;
        Profile: Profile;

        createdAt: Date;
        updatedAt: Date;
    }
}
