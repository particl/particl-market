// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import {OrderStatus} from '../../api/enums/OrderStatus';

declare module 'resources' {

    interface Order {
        id: number;
        hash: string;
        buyer: string;
        seller: string;
        status: OrderStatus;
        OrderItems: OrderItem[];
        ShippingAddress: Address;
        createdAt: Date;
        updatedAt: Date;
    }

}
