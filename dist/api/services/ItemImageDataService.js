"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ValidationException_1 = require("../exceptions/ValidationException");
const ItemImageDataRepository_1 = require("../repositories/ItemImageDataRepository");
const ItemImageDataCreateRequest_1 = require("../requests/ItemImageDataCreateRequest");
const ItemImageDataUpdateRequest_1 = require("../requests/ItemImageDataUpdateRequest");
let ItemImageDataService = class ItemImageDataService {
    constructor(itemImageDataRepo, Logger) {
        this.itemImageDataRepo = itemImageDataRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemImageDataRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemImageData = yield this.itemImageDataRepo.findOne(id, withRelated);
            if (itemImageData === null) {
                this.log.warn(`ItemImageData with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return itemImageData;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (body.dataId == null && body.protocol == null && body.encoding == null && body.data == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['dataId, protocol, encoding and data cannot all be null']);
            }
            // Save original
            const itemImageData = yield this.itemImageDataRepo.create(body);
            // finally find and return the created itemImageData
            const newItemImageData = yield this.findOne(itemImageData.Id);
            return newItemImageData;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (body.dataId == null && body.protocol == null && body.encoding == null && body.data == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['dataId, protocol, encoding and data cannot all be null']);
            }
            if (body.encoding !== 'BASE64') {
                this.log.warn('Unsupported image encoding. Only supports BASE64.');
            }
            // find the existing one without related
            const itemImageData = yield this.findOne(id, false);
            // set new values
            if (body.dataId) {
                itemImageData.DataId = body.dataId;
            }
            if (body.protocol) {
                itemImageData.Protocol = body.protocol;
            }
            if (body.imageVersion) {
                itemImageData.ImageVersion = body.imageVersion;
            }
            if (body.encoding) {
                itemImageData.Encoding = body.encoding;
            }
            if (body.data) {
                itemImageData.Data = body.data;
            }
            if (body.originalMime) {
                itemImageData.OriginalMime = body.originalMime;
            }
            if (body.originalName) {
                itemImageData.OriginalName = body.originalName;
            }
            // update itemImageData record
            const updatedItemImageData = yield this.itemImageDataRepo.update(id, itemImageData.toJSON());
            return updatedItemImageData;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.itemImageDataRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ItemImageDataCreateRequest_1.ItemImageDataCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ItemImageDataCreateRequest_1.ItemImageDataCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageDataService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ItemImageDataUpdateRequest_1.ItemImageDataUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ItemImageDataCreateRequest_1.ItemImageDataCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageDataService.prototype, "update", null);
ItemImageDataService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ItemImageDataRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ItemImageDataRepository_1.ItemImageDataRepository, Object])
], ItemImageDataService);
exports.ItemImageDataService = ItemImageDataService;
//# sourceMappingURL=ItemImageDataService.js.map