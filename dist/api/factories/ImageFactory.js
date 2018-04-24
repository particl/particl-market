"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const ItemCategoryFactory_1 = require("./ItemCategoryFactory");
const ImageProcessing_1 = require("../../core/helpers/ImageProcessing");
const ImageVersionEnumType_1 = require("../../core/helpers/ImageVersionEnumType");
const MessageException_1 = require("../exceptions/MessageException");
let ImageFactory = class ImageFactory {
    constructor(Logger, itemCategoryFactory) {
        this.Logger = Logger;
        this.itemCategoryFactory = itemCategoryFactory;
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
    getImageDatas(itemImageId, originalImageData, toVersions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!originalImageData.data) {
                throw new MessageException_1.MessageException('image data was empty.');
            }
            let originalData;
            try {
                originalData = yield ImageProcessing_1.ImageProcessing.convertToJPEG(originalImageData.data);
            }
            catch (ex) {
                throw ex;
            }
            // this.log.debug('originalData: ', originalData);
            const resizedDatas = yield ImageProcessing_1.ImageProcessing.resizeImageData(originalData, toVersions);
            // this.log.debug('resizedDatas: ', resizedDatas);
            const imageDatas = [];
            // first create the original
            const imageDataForOriginal = {
                item_image_id: itemImageId,
                dataId: this.getImageUrl(itemImageId, ImageVersionEnumType_1.ImageVersions.ORIGINAL.propName),
                protocol: originalImageData.protocol,
                imageVersion: ImageVersionEnumType_1.ImageVersions.ORIGINAL.propName,
                encoding: originalImageData.encoding,
                originalMime: originalImageData.originalMime,
                originalName: originalImageData.originalName,
                data: originalData
            };
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
                };
                imageDatas.push(imageData);
            }
            return imageDatas;
        });
    }
    getImageUrl(itemImageId, version) {
        return process.env.APP_HOST
            + (process.env.APP_PORT ? ':' + process.env.APP_PORT : '')
            + '/api/item-images/' + itemImageId + '/' + version;
    }
};
ImageFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Factory.ItemCategoryFactory)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemCategoryFactory_1.ItemCategoryFactory])
], ImageFactory);
exports.ImageFactory = ImageFactory;
//# sourceMappingURL=ImageFactory.js.map