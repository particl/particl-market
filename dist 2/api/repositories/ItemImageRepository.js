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
let ItemImageRepository = class ItemImageRepository {
    constructor(ItemImageModel, Logger) {
        this.ItemImageModel = ItemImageModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ItemImageModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.ItemImageModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const startTime = new Date().getTime();
            const itemImage = this.ItemImageModel.forge(data);
            try {
                const itemImageCreated = yield itemImage.save();
                const result = yield this.ItemImageModel.fetchById(itemImageCreated.id);
                this.log.debug('itemImageRepository.create: ' + (new Date().getTime() - startTime) + 'ms');
                return result;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the itemImage!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemImage = this.ItemImageModel.forge({ id });
            try {
                const itemImageUpdated = yield itemImage.save(data, { patch: true });
                return yield this.ItemImageModel.fetchById(itemImageUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the itemImage!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let itemImage = this.ItemImageModel.forge({ id });
            try {
                itemImage = yield itemImage.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield itemImage.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the itemImage!', error);
            }
        });
    }
};
ItemImageRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ItemImage)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ItemImageRepository);
exports.ItemImageRepository = ItemImageRepository;
//# sourceMappingURL=ItemImageRepository.js.map