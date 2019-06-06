// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MPActionExtended } from '../../api/enums/MPActionExtended';

declare module 'resources' {

    interface Bid {
        id: number;
        msgid: string;
        hash: string;
        bidder: string;
        generatedAt: number;
        type: MPAction | MPActionExtended;
        BidDatas: BidData[];
        ListingItem: ListingItem;
        ShippingAddress: Address;
        OrderItem: OrderItem;
        ParentBid: Bid;
        ChildBids: Bid[];

        parentBidId: number;    // used in OrderItemStatusCommand

        createdAt: Date;
        updatedAt: Date;
    }

}
