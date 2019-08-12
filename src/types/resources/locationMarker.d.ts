// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface LocationMarker {
        id: number;
        title: string;
        description: string;
        lat: number;
        lng: number;
        createdAt: Date;
        updatedAt: Date;
    }

}
