// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketType } from '../../api/enums/MarketType';

declare module 'resources' {

    interface Market {
        id: number;
        msgid: string;
        hash: string;
        name: string;
        description: string;
        type: MarketType;
        receiveKey: string;
        receiveAddress: string;
        publishKey: string;
        publishAddress: string;

        removed: boolean;
        expiryTime: number;
        generatedAt: number;
        receivedAt: number;
        postedAt: number;
        expiredAt: number;

        Profile: Profile;
        Identity: Identity;
        FlaggedItem: FlaggedItem;
        Image: ItemImage;

        createdAt: Date;
        updatedAt: Date;
    }
}
