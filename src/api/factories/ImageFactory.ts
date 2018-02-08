import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import { ImageProcessing } from '../../core/helpers/ImageProcessing';
import { ImageVersion } from '../../core/helpers/ImageVersion';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
import { ImageVersions } from '../../core/helpers/ImageVersionEnumType';
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

        const originalData: string = await ImageProcessing.convertToJPEG(originalImageData.data);
        // this.log.debug('originalData: ', originalData);

        const resizedDatas: Map<string, string> = await ImageProcessing.resizeImageData(originalData, toVersions);
        // this.log.debug('resizedDatas: ', resizedDatas);

        const imageDatas: ItemImageDataCreateRequest[] = [];

        // first create the original
        const imageDataForOriginal = {
            item_image_id: itemImageId,
            dataId: originalImageData.dataId,
            protocol: originalImageData.protocol,
            imageVersion: ImageVersions.ORIGINAL.propName,
            encoding: originalImageData.encoding,
            data: originalData
        } as ItemImageDataCreateRequest;
        imageDatas.push(imageDataForOriginal);

        for (const version of toVersions) {
            const imageData = {
                item_image_id: itemImageId,
                dataId: originalImageData.dataId,
                protocol: originalImageData.protocol,
                imageVersion: version.propName,
                encoding: originalImageData.encoding,
                data: resizedDatas.get(version.propName)
            } as ItemImageDataCreateRequest;
            imageDatas.push(imageData);
        }
        return imageDatas;
    }
}
