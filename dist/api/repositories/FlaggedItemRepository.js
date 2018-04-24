"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let FlaggedItemRepository = class FlaggedItemRepository {
    constructor(FlaggedItemModel, Logger) {
        this.FlaggedItemModel = FlaggedItemModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.FlaggedItemModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.FlaggedItemModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const flaggedItem = this.FlaggedItemModel.forge(data);
            try {
                const flaggedItemCreated = yield flaggedItem.save();
                return this.FlaggedItemModel.fetchById(flaggedItemCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the flaggedItem!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const flaggedItem = this.FlaggedItemModel.forge({ id });
            try {
                const flaggedItemUpdated = yield flaggedItem.save(data, { patch: true });
                return this.FlaggedItemModel.fetchById(flaggedItemUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the flaggedItem!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let flaggedItem = this.FlaggedItemModel.forge({ id });
            try {
                flaggedItem = yield flaggedItem.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield flaggedItem.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the flaggedItem!', error);
            }
        });
    }
};
FlaggedItemRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.FlaggedItem)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], FlaggedItemRepository);
exports.FlaggedItemRepository = FlaggedItemRepository;
//# sourceMappingURL=FlaggedItemRepository.js.map