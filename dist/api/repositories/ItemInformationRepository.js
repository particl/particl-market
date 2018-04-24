"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ItemInformationRepository = class ItemInformationRepository {
    constructor(ItemInformationModel, Logger) {
        this.ItemInformationModel = ItemInformationModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ItemInformationModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemInformationModel.fetchById(id, withRelated);
        });
    }
    findByItemTemplateId(listingItemTemplateId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemInformationModel.findByItemTemplateId(listingItemTemplateId, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemInformation = this.ItemInformationModel.forge(data);
            try {
                const itemInformationCreated = yield itemInformation.save();
                return this.ItemInformationModel.fetchById(itemInformationCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the itemInformation!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemInformation = this.ItemInformationModel.forge({ id });
            try {
                const itemInformationUpdated = yield itemInformation.save(data, { patch: true });
                return this.ItemInformationModel.fetchById(itemInformationUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the itemInformation!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let itemInformation = this.ItemInformationModel.forge({ id });
            try {
                itemInformation = yield itemInformation.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield itemInformation.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the itemInformation!', error);
            }
        });
    }
};
ItemInformationRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ItemInformation)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ItemInformationRepository);
exports.ItemInformationRepository = ItemInformationRepository;
//# sourceMappingURL=ItemInformationRepository.js.map