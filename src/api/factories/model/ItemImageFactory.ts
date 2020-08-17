// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageCreateRequest } from '../../requests/model/ItemImageCreateRequest';
import { ItemImageDataCreateRequest } from '../../requests/model/ItemImageDataCreateRequest';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { ItemImageDataService } from '../../services/model/ItemImageDataService';
import { DSN } from 'omp-lib/dist/interfaces/dsn';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { ItemImageCreateParams } from './ModelCreateParams';

export class ItemImageFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a ItemImageCreateRequest
     *
     * @param params
     */
    public async get(params: ItemImageCreateParams): Promise<ItemImageCreateRequest> {

        const data: ItemImageDataCreateRequest[] = await this.getItemImageDataCreateRequests(params.image.data);

        const createRequest = {
            featured: params.image.featured,
            data,
            hash: params.image.hash     // when receiving ListingItem, we should receive the correct hash
        } as ItemImageCreateRequest;

        return createRequest;
    }

    private async getItemImageDataCreateRequests(dsns: DSN[]): Promise<ItemImageDataCreateRequest[]> {

        const imageDataCreateRequests: ItemImageDataCreateRequest[] = [];

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
            } as ItemImageDataCreateRequest);
        }
        return imageDataCreateRequests;
    }
}
