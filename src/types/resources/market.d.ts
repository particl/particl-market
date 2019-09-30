// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketType } from '../../api/enums/MarketType';

declare module 'resources' {

    interface Market {
        id: number;
        name: string;
        type: MarketType;
        receiveKey: string;
        receiveAddress: string;
        publishKey: string;
        publishAddress: string;

        Identity: Identity;

        createdAt: Date;
        updatedAt: Date;
    }
}
