// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import {Address} from '../../api/models/Address';

declare module 'resources' {

    interface Order {
        id: number;
        hash: string;
        buyer: string;
        seller: string;
        createdAt: Date;
        updatedAt: Date;
        OrderItems: OrderItem[];
        ShippingAddress: Address;
    }

}
