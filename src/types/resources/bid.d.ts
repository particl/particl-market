// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

declare module 'resources' {

    interface Bid {
        id: number;
        msgid: string;
        hash: string;
        bidder: string;
        generatedAt: number;
        type: MPAction;
        BidDatas: BidData[];
        ListingItem: ListingItem;
        ShippingAddress: Address;
        OrderItem: OrderItem;
        ParentBid: Bid;
        ChildBids: Bid[];

        createdAt: Date;
        updatedAt: Date;
    }

}
