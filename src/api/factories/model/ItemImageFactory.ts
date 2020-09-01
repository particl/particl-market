// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ImageCreateRequest } from '../../requests/model/ImageCreateRequest';
import { ImageDataCreateRequest } from '../../requests/model/ImageDataCreateRequest';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { ImageDataService } from '../../services/model/ImageDataService';
import { DSN } from 'omp-lib/dist/interfaces/dsn';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { ImageCreateParams } from './ModelCreateParams';

export class ItemImageFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public itemImageDataService: ImageDataService
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a ImageCreateRequest
     *
     * @param params
     */
    public async get(params: ImageCreateParams): Promise<ImageCreateRequest> {

        const data: ImageDataCreateRequest[] = await this.getItemImageDataCreateRequests(params.image.data);

        const createRequest = {
            featured: params.image.featured,
            data,
            hash: params.image.hash     // when receiving ListingItem, we should receive the correct hash
        } as ImageCreateRequest;

        return createRequest;
    }

    private async getItemImageDataCreateRequests(dsns: DSN[]): Promise<ImageDataCreateRequest[]> {

        const imageDataCreateRequests: ImageDataCreateRequest[] = [];

        for (const dsn of dsns) {
            // there is no imageVersion on the DSN, so when we receive the ListingItemAddMessage or
            // the ListingItemImageAddMessage, we're always receiving the ORIGINAL version of the Image

            // when we receive ListingItemAddMessage -> ProtocolDSN.SMSG
            // when we receive ListingItemImageAddMessage -> ProtocolDSN.LOCAL
            imageDataCreateRequests.push({
                protocol: dsn.protocol,
                encoding: dsn.encoding,
                dataId: dsn.dataId,
                imageVersion: ImageVersions.ORIGINAL.propName,
                data: dsn.data

                // imageHash,       // added after image is created?
                // originalMime,    // ?
                // originalName     // ?
            } as ImageDataCreateRequest);
        }
        return imageDataCreateRequests;
    }
}
