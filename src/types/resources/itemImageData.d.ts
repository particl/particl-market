// Copyright (c) 2017-2019, The Particl Market developers
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
        imageHash: string;
        originalMime: string;
        originalName: string;
        itemImageId: number;
        featured: boolean;
        createdAt: Date;
        updatedAt: Date;

        ItemImage: ItemImage;
    }

}
