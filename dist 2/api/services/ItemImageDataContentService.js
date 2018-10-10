"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ItemImageDataContentRepository_1 = require("../repositories/ItemImageDataContentRepository");
const ItemImageDataContentCreateRequest_1 = require("../requests/ItemImageDataContentCreateRequest");
const ItemImageDataContentUpdateRequest_1 = require("../requests/ItemImageDataContentUpdateRequest");
let ItemImageDataContentService = class ItemImageDataContentService {
    constructor(itemImageDataContentRepo, Logger) {
        this.itemImageDataContentRepo = itemImageDataContentRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemImageDataContentRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemImageDataContent = yield this.itemImageDataContentRepo.findOne(id, withRelated);
            if (itemImageDataContent === null) {
                this.log.warn(`ItemImageDataContent with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return itemImageDataContent;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create ItemImageDataContent, body: ', JSON.stringify(body, null, 2));
            // TODO: extract and remove related models from request
            // const itemImageDataContentRelated = body.related;
            // delete body.related;
            // If the request body was valid we will create the itemImageDataContent
            const itemImageDataContent = yield this.itemImageDataContentRepo.create(body);
            // TODO: create related models
            // itemImageDataContentRelated._id = itemImageDataContent.Id;
            // await this.itemImageDataContentRelatedService.create(itemImageDataContentRelated);
            // finally find and return the created itemImageDataContent
            const newItemImageDataContent = yield this.findOne(itemImageDataContent.id);
            return newItemImageDataContent;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const itemImageDataContent = yield this.findOne(id, false);
            // set new values
            itemImageDataContent.Data = body.data;
            // update itemImageDataContent record
            const updatedItemImageDataContent = yield this.itemImageDataContentRepo.update(id, itemImageDataContent.toJSON());
            // const newItemImageDataContent = await this.findOne(id);
            // return newItemImageDataContent;
            return updatedItemImageDataContent;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.itemImageDataContentRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ItemImageDataContentCreateRequest_1.ItemImageDataContentCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ItemImageDataContentCreateRequest_1.ItemImageDataContentCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageDataContentService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ItemImageDataContentUpdateRequest_1.ItemImageDataContentUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ItemImageDataContentUpdateRequest_1.ItemImageDataContentUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageDataContentService.prototype, "update", null);
ItemImageDataContentService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ItemImageDataContentRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ItemImageDataContentRepository_1.ItemImageDataContentRepository, Object])
], ItemImageDataContentService);
exports.ItemImageDataContentService = ItemImageDataContentService;
//# sourceMappingURL=ItemImageDataContentService.js.map