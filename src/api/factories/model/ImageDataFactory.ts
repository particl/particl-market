// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ItemCategoryFactory } from '../ItemCategoryFactory';
import { ImageVersion } from '../../../core/helpers/ImageVersion';
import { ImageDataCreateRequest } from '../../requests/model/ImageDataCreateRequest';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { DSN, ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { ImageCreateParams } from './ModelCreateParams';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableImageCreateRequestConfig } from '../hashableconfig/createrequest/HashableImageCreateRequestConfig';
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { BaseImageAddMessage } from '../../messages/action/BaseImageAddMessage';


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
        // this.log.debug('params: ', JSON.stringify(params, null, 2));

        // there is no imageVersion on the DSN, so when we receive the ListingItemAddMessage or
        // the ListingItemImageAddMessage, we're always receiving the ORIGINAL version of the Image

        const actionMessage: BaseImageAddMessage = params.actionMessage;
        const dsn: DSN = actionMessage.data[0];

        let hash = actionMessage.hash;

        switch (dsn.protocol) {
            case ProtocolDSN.FILE:
                // todo: try to load an existing local file
                break;
            case ProtocolDSN.REQUEST:
                // data is in dsn.data, called from ImageAddCommand
                dsn.protocol = ProtocolDSN.FILE;
                // only calculate hash when uploading new image
                hash = ConfigurableHasher.hash({data: dsn.data}, new HashableImageCreateRequestConfig());
                break;
            case ProtocolDSN.SMSG:
                // data will be received in a separate smsg.
                // ...this could also be the separate smsg, so if data exists, store as FILE
                if (!_.isEmpty(dsn.data)) {
                    dsn.protocol = ProtocolDSN.FILE;
                }
                break;
            case ProtocolDSN.IPFS:
            case ProtocolDSN.URL:
            default:
                throw new NotImplementedException();
        }

        const imageDataCreateRequest = {
            protocol: dsn.protocol,
            encoding: dsn.encoding,
            dataId: dsn.dataId,
            imageVersion: ImageVersions.ORIGINAL.propName,
            data: dsn.data,
            imageHash: hash
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
