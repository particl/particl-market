"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const ListingItemTemplateService_1 = require("../services/ListingItemTemplateService");
const ItemImageService_1 = require("../services/ItemImageService");
const ImagePostUploadRequest_1 = require("../requests/ImagePostUploadRequest");
let ItemImageHttpUploadService = class ItemImageHttpUploadService {
    constructor(listingItemTemplateService, itemImageService, Logger) {
        this.listingItemTemplateService = listingItemTemplateService;
        this.itemImageService = itemImageService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    httpPostImageUpload(uploadRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: ImagePostUploadRequest.id, should be names templateId and not just some random id
            const createdItemImages = [];
            const listingItemTemplate = yield this.listingItemTemplateService.findOne(uploadRequest.id);
            for (const file of uploadRequest.request.files) {
                const createdItemImage = yield this.itemImageService.createFile(file, listingItemTemplate);
                createdItemImages.push(createdItemImage.toJSON());
            }
            return createdItemImages;
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ImagePostUploadRequest_1.ImagePostUploadRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ImagePostUploadRequest_1.ImagePostUploadRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageHttpUploadService.prototype, "httpPostImageUpload", null);
ItemImageHttpUploadService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemImageService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ListingItemTemplateService_1.ListingItemTemplateService,
        ItemImageService_1.ItemImageService, Object])
], ItemImageHttpUploadService);
exports.ItemImageHttpUploadService = ItemImageHttpUploadService;
//# sourceMappingURL=ItemImageHttpUploadService.js.map