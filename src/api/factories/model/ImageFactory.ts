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
import { ContentReference, DSN, ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { ImageCreateParams } from './ModelCreateParams';
import { ImageDataFactory } from './ImageDataFactory';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableImageCreateRequestConfig } from '../hashableconfig/createrequest/HashableImageCreateRequestConfig';

export class ImageFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.model.ImageDataFactory) private imageDataFactory: ImageDataFactory
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a ImageCreateRequest
     *
     * When Image is first created, we only create the ImageData for the ORIGINAL version, other versions are
     * created soon after..
     *
     * @param params
     */
    public async get(params: ImageCreateParams): Promise<ImageCreateRequest> {

        const contentReference: ContentReference = params.image;

        // get the ImageDataCreateRequest for the ORIGINAL version
        const dataCreateRequest: ImageDataCreateRequest = await this.imageDataFactory.get(params);

        // when receiving ListingItemAddMessage, we should receive the correct hash in contentReference
        // when uploading, it was calculated for the ORIGINAL version in the dataCreateRequest
        const hash = contentReference.hash ? contentReference.hash : dataCreateRequest.imageHash;

        const createRequest = {
            item_information_id: params.listingItemTemplate && !_.isNil(params.listingItemTemplate.ItemInformation)
                ? params.listingItemTemplate.ItemInformation.id : undefined,
            featured: contentReference.featured,
            data: [dataCreateRequest],
            hash
        } as ImageCreateRequest;

        return createRequest;
    }

}
