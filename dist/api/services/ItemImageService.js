"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ItemImageRepository_1 = require("../repositories/ItemImageRepository");
const ItemImageCreateRequest_1 = require("../requests/ItemImageCreateRequest");
const ItemImageUpdateRequest_1 = require("../requests/ItemImageUpdateRequest");
const ItemImageDataService_1 = require("./ItemImageDataService");
const ImageFactory_1 = require("../factories/ImageFactory");
const ImageVersionEnumType_1 = require("../../core/helpers/ImageVersionEnumType");
const MessageException_1 = require("../exceptions/MessageException");
const ImageDataProtocolType_1 = require("../enums/ImageDataProtocolType");
const ListingItemTemplate_1 = require("../models/ListingItemTemplate");
const HashableObjectType_1 = require("../../api/enums/HashableObjectType");
const fs = require("fs");
const ObjectHash_1 = require("../../core/helpers/ObjectHash");
let ItemImageService = class ItemImageService {
    constructor(itemImageDataService, itemImageRepo, imageFactory, Logger) {
        this.itemImageDataService = itemImageDataService;
        this.itemImageRepo = itemImageRepo;
        this.imageFactory = imageFactory;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemImageRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemImage = yield this.itemImageRepo.findOne(id, withRelated);
            if (itemImage === null) {
                this.log.warn(`ItemImage with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return itemImage;
        });
    }
    /**
     * create(), but get data from a local file instead.
     *
     * @param imageFile
     * @param {ListingItemTemplate} listingItemTemplate
     * @returns {Promise<ItemImage>}
     */
    createFile(imageFile, listingItemTemplate) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: how am i supposed to know what imageFile contains? add type to it
            // Read the file data in
            const dataStr = fs.readFileSync(imageFile.path, 'base64');
            // this.log.error('dataStr = ' + dataStr);
            // find listing item template
            // this.log.debug('imageFile.mimetype = ' + imageFile.mimetype);
            // find related itemInformation
            const itemInformation = yield listingItemTemplate.related('ItemInformation').toJSON();
            const itemImageDataCreateRequest = {
                protocol: ImageDataProtocolType_1.ImageDataProtocolType.LOCAL,
                encoding: 'BASE64',
                data: dataStr,
                dataId: imageFile.fieldname,
                imageVersion: ImageVersionEnumType_1.ImageVersions.ORIGINAL.propName,
                originalMime: imageFile.mimetype,
                originalName: imageFile.originalname
            };
            const itemImageCreateRequest = {
                item_information_id: itemInformation.id,
                data: [itemImageDataCreateRequest]
            };
            this.log.debug(JSON.stringify(itemImageCreateRequest));
            return yield this.create(itemImageCreateRequest);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create image, body: ', JSON.stringify(body, null, 2));
            // extract and remove related models from request
            const itemImageDatas = body.data;
            delete body.data;
            const protocols = Object.keys(ImageDataProtocolType_1.ImageDataProtocolType)
                .map(key => (ImageDataProtocolType_1.ImageDataProtocolType[key]));
            // this.log.debug('protocols: ', protocols);
            const itemImageDataOriginal = _.find(itemImageDatas, (imageData) => {
                return imageData.imageVersion === ImageVersionEnumType_1.ImageVersions.ORIGINAL.propName;
            });
            // this.log.debug('itemImageDataOriginal: ', itemImageDataOriginal);
            // use the original image version to create a hash for the ItemImage
            body.hash = ObjectHash_1.ObjectHash.getHash(itemImageDataOriginal, HashableObjectType_1.HashableObjectType.ITEMIMAGEDATA_CREATEREQUEST);
            // if the request body was valid we will create the itemImage
            const itemImage = yield this.itemImageRepo.create(body);
            if (itemImageDataOriginal) {
                if (_.isEmpty(itemImageDataOriginal.protocol) || protocols.indexOf(itemImageDataOriginal.protocol) === -1) {
                    this.log.warn(`Invalid protocol <${itemImageDataOriginal.protocol}> encountered.`);
                    throw new MessageException_1.MessageException('Invalid image protocol.');
                }
                // TODO: THIS
                /* if ( !_.isEmpty(itemImageDatas.encoding) && !?????[itemImageDatas.encoding] ) {
                    this.log.warn(`Invalid encoding <${itemImageDatas.encoding}> encountered.`);
                    throw new NotFoundException('Invalid encoding.');
                } */
                // then create the imageDatas from the given original data
                if (!_.isEmpty(itemImageDataOriginal.data)) {
                    const toVersions = [ImageVersionEnumType_1.ImageVersions.LARGE, ImageVersionEnumType_1.ImageVersions.MEDIUM, ImageVersionEnumType_1.ImageVersions.THUMBNAIL];
                    const imageDatas = yield this.imageFactory.getImageDatas(itemImage.Id, itemImageDataOriginal, toVersions);
                    // save all image datas
                    for (const imageData of imageDatas) {
                        yield this.itemImageDataService.create(imageData);
                    }
                    // finally find and return the created itemImage
                    const newItemImage = yield this.findOne(itemImage.Id);
                    // this.log.debug('saved image:', JSON.stringify(newItemImage.toJSON(), null, 2));
                    return newItemImage;
                }
                else {
                    return itemImage;
                }
            }
            else {
                throw new MessageException_1.MessageException('Original image data not found.');
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // extract and remove related models from request
            const itemImageDatas = body.data;
            delete body.data;
            // find the existing one without related
            const itemImage = yield this.findOne(id, false);
            const protocols = Object.keys(ImageDataProtocolType_1.ImageDataProtocolType)
                .map(key => (ImageDataProtocolType_1.ImageDataProtocolType[key]));
            const itemImageDataOriginal = _.find(itemImageDatas, (imageData) => {
                return imageData.imageVersion === ImageVersionEnumType_1.ImageVersions.ORIGINAL.propName;
            });
            // use the original image version to create a hash for the ItemImage
            body.hash = ObjectHash_1.ObjectHash.getHash(itemImageDataOriginal, HashableObjectType_1.HashableObjectType.ITEMIMAGEDATA_CREATEREQUEST);
            if (itemImageDataOriginal) {
                if (_.isEmpty(itemImageDataOriginal.protocol) || protocols.indexOf(itemImageDataOriginal.protocol) === -1) {
                    this.log.warn(`Invalid protocol <${itemImageDataOriginal.protocol}> encountered.`);
                    throw new MessageException_1.MessageException('Invalid image protocol.');
                }
                // set new values
                itemImage.Hash = body.hash;
                // update itemImage record
                const updatedItemImage = yield this.itemImageRepo.update(id, itemImage.toJSON());
                // this.log.debug('updatedItemImage', JSON.stringify(updatedItemImage, null, 2));
                // find and remove old related ItemImageDatas
                const oldImageDatas = updatedItemImage.related('ItemImageDatas').toJSON();
                for (const imageData of oldImageDatas) {
                    yield this.itemImageDataService.destroy(imageData.id);
                }
                // then create new imageDatas from the given original data
                if (!_.isEmpty(itemImageDataOriginal)) {
                    const toVersions = [ImageVersionEnumType_1.ImageVersions.LARGE, ImageVersionEnumType_1.ImageVersions.MEDIUM, ImageVersionEnumType_1.ImageVersions.THUMBNAIL];
                    const imageDatas = yield this.imageFactory.getImageDatas(itemImage.Id, itemImageDataOriginal, toVersions);
                    // create new image datas
                    for (const imageData of imageDatas) {
                        const createdImageData = yield this.itemImageDataService.create(imageData);
                        this.log.debug('createdImageData: ', createdImageData.id);
                    }
                }
                // finally find and return the updated itemImage
                const newItemImage = yield this.findOne(id);
                return newItemImage;
            }
            else {
                throw new MessageException_1.MessageException('Original image data not found.');
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.itemImageRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemTemplate_1.ListingItemTemplate]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageService.prototype, "createFile", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ItemImageCreateRequest_1.ItemImageCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ItemImageCreateRequest_1.ItemImageCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ItemImageUpdateRequest_1.ItemImageUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ItemImageUpdateRequest_1.ItemImageUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageService.prototype, "update", null);
ItemImageService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ItemImageDataService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Repository.ItemImageRepository)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Factory.ImageFactory)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ItemImageDataService_1.ItemImageDataService,
        ItemImageRepository_1.ItemImageRepository,
        ImageFactory_1.ImageFactory, Object])
], ItemImageService);
exports.ItemImageService = ItemImageService;
//# sourceMappingURL=ItemImageService.js.map