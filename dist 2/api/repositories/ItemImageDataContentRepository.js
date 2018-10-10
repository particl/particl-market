"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ItemImageDataContentRepository = class ItemImageDataContentRepository {
    constructor(ItemImageDataContentModel, Logger) {
        this.ItemImageDataContentModel = ItemImageDataContentModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ItemImageDataContentModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemImageDataContentModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemImageDataContent = this.ItemImageDataContentModel.forge(data);
            try {
                const itemImageDataContentCreated = yield itemImageDataContent.save();
                return this.ItemImageDataContentModel.fetchById(itemImageDataContentCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the itemImageDataContent!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemImageDataContent = this.ItemImageDataContentModel.forge({ id });
            try {
                const itemImageDataContentUpdated = yield itemImageDataContent.save(data, { patch: true });
                return this.ItemImageDataContentModel.fetchById(itemImageDataContentUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the itemImageDataContent!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let itemImageDataContent = this.ItemImageDataContentModel.forge({ id });
            try {
                itemImageDataContent = yield itemImageDataContent.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield itemImageDataContent.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the itemImageDataContent!', error);
            }
        });
    }
};
ItemImageDataContentRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ItemImageDataContent)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ItemImageDataContentRepository);
exports.ItemImageDataContentRepository = ItemImageDataContentRepository;
//# sourceMappingURL=ItemImageDataContentRepository.js.map