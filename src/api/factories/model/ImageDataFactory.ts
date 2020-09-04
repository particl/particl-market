// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryFactory } from '../ItemCategoryFactory';
import { ImageProcessing } from '../../../core/helpers/ImageProcessing';
import { ImageVersion } from '../../../core/helpers/ImageVersion';
import { ImageDataCreateRequest } from '../../requests/model/ImageDataCreateRequest';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import {ContentReference, DSN, ProtocolDSN} from 'omp-lib/dist/interfaces/dsn';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { ImageCreateParams } from './ModelCreateParams';
import {ConfigurableHasher} from 'omp-lib/dist/hasher/hash';
import {HashableImageCreateRequestConfig} from '../hashableconfig/createrequest/HashableImageCreateRequestConfig';


export class ImageDataFactory  implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * TODO: support for multiple dsns
     *
     * @param params
     */
    public async get(params: ImageCreateParams): Promise<ImageDataCreateRequest> {

        // there is no imageVersion on the DSN, so when we receive the ListingItemAddMessage or
        // the ListingItemImageAddMessage, we're always receiving the ORIGINAL version of the Image

        const contentReference: ContentReference = params.image;
        const dsn: DSN = contentReference.data[0];

        // only calculate hash when uploading new image
        const hash = dsn.protocol === ProtocolDSN.REQUEST
            ? ConfigurableHasher.hash({data: dsn.data}, new HashableImageCreateRequestConfig())
            : contentReference.hash;

        const imageDataCreateRequest = {
            protocol: dsn.protocol,
            encoding: dsn.encoding,
            dataId: dsn.dataId,
            imageVersion: ImageVersions.ORIGINAL.propName,
            data: dsn.data,
            imageHash: hash
            // dataId: 'will be set to filename'
        } as ImageDataCreateRequest;

        return imageDataCreateRequest;
    }



    // todo: remove
    public async getImageDataCreateRequest(itemImageId: number, imageVersion: ImageVersion, imageHash: string, protocol: ProtocolDSN, data: string | undefined,
                                           encoding: string | undefined, originalMime: string | undefined, originalName: string | undefined
    ): Promise<ImageDataCreateRequest> {

        const imageData = {
            image_id: itemImageId,
            dataId: this.getImageUrl(itemImageId, imageVersion.propName),
            protocol,
            imageVersion: imageVersion.propName,
            imageHash,
            encoding,
            originalMime,
            originalName,
            data
        } as ImageDataCreateRequest;
        return imageData;
    }

    public getImageUrl(itemImageId: number, version: string): string {
        return process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/images/' + itemImageId + '/' + version;
    }

}
