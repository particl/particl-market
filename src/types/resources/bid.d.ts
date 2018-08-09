// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BidMessageType } from '../../api/enums/BidMessageType';

declare module 'resources' {

    interface Bid {
        id: number;
        bidder: string;
        action: BidMessageType;
        createdAt: Date;
        updatedAt: Date;
        BidDatas: BidData[];
        ListingItem: ListingItem;
        ShippingAddress: Address;
        OrderItem: OrderItem;
    }

}
