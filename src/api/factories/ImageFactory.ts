// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import { ImageProcessing } from '../../core/helpers/ImageProcessing';
import { ImageVersion } from '../../core/helpers/ImageVersion';
import { ItemImageDataCreateRequest } from '../requests/model/ItemImageDataCreateRequest';
import { ImageVersions } from '../../core/helpers/ImageVersionEnumType';
import { MessageException } from '../exceptions/MessageException';

export class ImageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * creates ItemImageDataCreateRequests for the required image versions from the original image data
     *
     * @param {number} itemImageId
     * @param imageHash
     * @param {ItemImageDataCreateRequest} originalImageData
     * @param {ImageVersion[]} toVersions
     * @returns {Promise<ItemImageDataCreateRequest[]>}
     */
    public async getImageDatas(
        itemImageId: number,
        imageHash: string,
        originalImageData: ItemImageDataCreateRequest,
        toVersions: ImageVersion[]
    ): Promise<ItemImageDataCreateRequest[]> {
        let startTime = new Date().getTime();

        if ( !originalImageData.data ) {
            throw new MessageException('image data was empty.');
        }

        const originalData = await ImageProcessing.convertToJPEG(originalImageData.data);
        this.log.debug('ImageFactory.getImageDatas: ' + (new Date().getTime() - startTime) + 'ms');


        startTime = new Date().getTime();
        const resizedDatas: Map<string, string> = await ImageProcessing.resizeImageData(originalData, toVersions);
        this.log.debug('ImageProcessing.resizeImageData: ' + (new Date().getTime() - startTime) + 'ms');

        // this.log.debug('resizedDatas: ', resizedDatas);

        const imageDatas: ItemImageDataCreateRequest[] = [];

        // first create the original
        const imageDataForOriginal = await this.getImageDataCreateRequest(itemImageId, ImageVersions.ORIGINAL, imageHash,
            originalImageData.protocol, originalData, originalImageData.encoding, originalImageData.originalMime,
            originalImageData.originalName);

        imageDatas.push(imageDataForOriginal);

        for (const version of toVersions) {
            const imageData = await this.getImageDataCreateRequest(itemImageId, version, imageHash, originalImageData.protocol,
                resizedDatas.get(version.propName) || '', originalImageData.encoding, originalImageData.originalMime,
                originalImageData.originalName);
            imageDatas.push(imageData);
        }
        return imageDatas;
    }

    public async getImageDataCreateRequest(itemImageId: number, imageVersion: ImageVersion, imageHash: string, protocol: string,
                                           data: string, encoding: string | null, originalMime: string | null, originalName: string | null
    ): Promise<ItemImageDataCreateRequest> {

        const imageData = {
            item_image_id: itemImageId,
            dataId: this.getImageUrl(itemImageId, imageVersion.propName),
            protocol,
            imageVersion: imageVersion.propName,
            imageHash,
            encoding,
            originalMime,
            originalName,
            data
        } as ItemImageDataCreateRequest;
        return imageData;
    }

    public getImageUrl(itemImageId: number, version: string): string {
        return process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + itemImageId + '/' + version;
    }

}
