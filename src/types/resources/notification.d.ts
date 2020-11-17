// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface Notification {
        id: number;
        type: string;
        objectId: number;
        objectHash: string;
        parentObjectId: number;
        parentObjectHash: string;
        target: string;
        from: string;
        to: string;
        market: string;
        category: string;
        read: boolean;
        Profile: Profile;
        createdAt: Date;
        updatedAt: Date;
    }

}
