import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import { ImageProcessing } from '../../core/helpers/ImageProcessing';
import { ImageVersion } from '../../core/helpers/ImageVersion';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
import { ImageVersions } from '../../core/helpers/ImageVersionEnumType';
import { MessageException } from '../exceptions/MessageException';
import * as _ from 'lodash';

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
     * @param {ItemImageDataCreateRequest} originalImageData
     * @param {ImageVersion[]} toVersions
     * @returns {Promise<ItemImageDataCreateRequest[]>}
     */
    public async getImageDatas(
        itemImageId: number,
        originalImageData: ItemImageDataCreateRequest,
        toVersions: ImageVersion[]
    ): Promise<ItemImageDataCreateRequest[]> {

        if ( !originalImageData.data ) {
            throw new MessageException('image data was empty.');
        }
        let originalData: string;
        try {
            originalData = await ImageProcessing.convertToJPEG(originalImageData.data);
        } catch ( ex ) {
            throw ex;
        }
        // this.log.debug('originalData: ', originalData);

        const resizedDatas: Map<string, string> = await ImageProcessing.resizeImageData(originalData, toVersions);
        // this.log.debug('resizedDatas: ', resizedDatas);

        const imageDatas: ItemImageDataCreateRequest[] = [];

        // first create the original
        const imageDataForOriginal = {
            item_image_id: itemImageId,
            dataId: this.getImageUrl(itemImageId, ImageVersions.ORIGINAL.propName),
            protocol: originalImageData.protocol,
            imageVersion: ImageVersions.ORIGINAL.propName,
            encoding: originalImageData.encoding,
            originalMime: originalImageData.originalMime,
            originalName: originalImageData.originalName,
            data: originalData
        } as ItemImageDataCreateRequest;
        imageDatas.push(imageDataForOriginal);

        for (const version of toVersions) {
            const imageData = {
                item_image_id: itemImageId,
                dataId: this.getImageUrl(itemImageId, version.propName),
                protocol: originalImageData.protocol,
                imageVersion: version.propName,
                encoding: originalImageData.encoding,
                originalMime: originalImageData.originalMime,
                originalName: originalImageData.originalName,
                data: resizedDatas.get(version.propName)
            } as ItemImageDataCreateRequest;
            imageDatas.push(imageData);
        }
        return imageDatas;
    }

    public getImageUrl(itemImageId: number, version: string): string {
        return process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + itemImageId + '/' + version;
    }

}
