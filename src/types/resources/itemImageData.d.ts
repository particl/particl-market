// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';

declare module 'resources' {

    interface ItemImageData {
        id: number;
        dataId: string;
        protocol: ProtocolDSN;
        encoding: string;
        data: string;
        imageVersion: string;
        imageHash: string;
        originalMime: string;
        originalName: string;
        itemImageId: number;    // TODO: should get rid of this, used only in createResizedTemplateImages
        featured: boolean;
        createdAt: Date;
        updatedAt: Date;

        ItemImage: ItemImage;
    }

}
