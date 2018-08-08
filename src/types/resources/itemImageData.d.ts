// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface ItemImageData {
        id: number;
        dataId: string;
        protocol: string;
        encoding: string;
        data: string;
        imageVersion: string;
        createdAt: Date;
        updatedAt: Date;
        ItemImageDataContent: ItemImageDataContent;
    }

}
