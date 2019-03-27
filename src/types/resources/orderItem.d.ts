// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { OrderItemStatus } from '../../api/enums/OrderItemStatus';

declare module 'resources' {

    interface OrderItem {
        id: number;
        status: OrderItemStatus;
        itemHash: string;
        Bid: Bid;
        OrderItemObjects: OrderItemObject[];
        Order: Order;
        createdAt: Date;
        updatedAt: Date;
    }

}
