"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const inversify_express_utils_1 = require("inversify-express-utils");
const constants_1 = require("../../constants");
const app_1 = require("../../app");
const ItemImageService_1 = require("../services/ItemImageService");
const ItemImageHttpUploadService_1 = require("../services/ItemImageHttpUploadService");
const ImagePostUploadRequest_1 = require("../requests/ImagePostUploadRequest");
const _ = require("lodash");
const Jimp = require("jimp");
// Get middlewares
const restApi = app_1.app.IoC.getNamed(constants_1.Types.Middleware, constants_1.Targets.Middleware.AuthenticateMiddleware);
const multerMiddleware = app_1.app.IoC.getNamed(constants_1.Types.Middleware, constants_1.Targets.Middleware.MulterMiddleware);
let ItemImageController = class ItemImageController {
    constructor(itemImageService, itemImageHttpUploadService, Logger) {
        this.itemImageService = itemImageService;
        this.itemImageHttpUploadService = itemImageHttpUploadService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    create(res, templateId, body, req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemImageHttpUploadService.httpPostImageUpload(new ImagePostUploadRequest_1.ImagePostUploadRequest({
                result: res,
                id: templateId,
                requestBody: body,
                request: req
            }));
        });
    }
    publishImage(res, id, imageVersion) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the itemImage by id
            const itemImage = yield this.itemImageService.findOne(parseInt(id, 10));
            const itemImageResult = itemImage.toJSON();
            // search the itemImageData like params image version
            const imgVersion = yield _.find(itemImageResult.ItemImageDatas, data => data['imageVersion'] === imageVersion);
            if (itemImage === null || itemImageResult.ItemImageDatas.length === 0 || !imgVersion) {
                res.status(404).send('Image Not found');
            }
            else {
                const dataBuffer = new Buffer(imgVersion['data'], 'base64');
                const imageBuffer = yield Jimp.read(dataBuffer);
                res.setHeader('Content-Disposition', 'filename=' + imageVersion + '.'
                    + imageBuffer.getExtension());
                res.send(dataBuffer);
            }
        });
    }
};
tslib_1.__decorate([
    inversify_express_utils_1.httpPost('/template/:templateId'),
    tslib_1.__param(0, inversify_express_utils_1.response()), tslib_1.__param(1, inversify_express_utils_1.requestParam('templateId')),
    tslib_1.__param(2, inversify_express_utils_1.requestBody()), tslib_1.__param(3, inversify_express_utils_1.request()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageController.prototype, "create", null);
tslib_1.__decorate([
    inversify_express_utils_1.httpGet('/:id/:imageVersion'),
    tslib_1.__param(0, inversify_express_utils_1.response()), tslib_1.__param(1, inversify_express_utils_1.requestParam('id')), tslib_1.__param(2, inversify_express_utils_1.requestParam('imageVersion')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageController.prototype, "publishImage", null);
ItemImageController = tslib_1.__decorate([
    inversify_express_utils_1.controller('/item-images', multerMiddleware.use, restApi.use),
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ItemImageService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemImageHttpUploadService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ItemImageService_1.ItemImageService,
        ItemImageHttpUploadService_1.ItemImageHttpUploadService, Object])
], ItemImageController);
exports.ItemImageController = ItemImageController;
//# sourceMappingURL=ItemImageController.js.map