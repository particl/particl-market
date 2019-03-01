// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

declare module 'resources' {

    interface Bid {
        id: number;
        bidder: string;
        action: MPAction;
        createdAt: Date;
        updatedAt: Date;
        BidDatas: BidData[];
        ListingItem: ListingItem;
        ShippingAddress: Address;
        OrderItem: OrderItem;
    }

}
