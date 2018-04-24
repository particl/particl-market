import { Logger as LoggerType } from '../../core/Logger';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import { ImageVersion } from '../../core/helpers/ImageVersion';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
export declare class ImageFactory {
    Logger: typeof LoggerType;
    private itemCategoryFactory;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemCategoryFactory: ItemCategoryFactory);
    /**
     * creates ItemImageDataCreateRequests for the required image versions from the original image data
     *
     * @param {number} itemImageId
     * @param {ItemImageDataCreateRequest} originalImageData
     * @param {ImageVersion[]} toVersions
     * @returns {Promise<ItemImageDataCreateRequest[]>}
     */
    getImageDatas(itemImageId: number, originalImageData: ItemImageDataCreateRequest, toVersions: ImageVersion[]): Promise<ItemImageDataCreateRequest[]>;
    getImageUrl(itemImageId: number, version: string): string;
}
