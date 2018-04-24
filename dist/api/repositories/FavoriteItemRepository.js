"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let FavoriteItemRepository = class FavoriteItemRepository {
    constructor(FavoriteItemModel, Logger) {
        this.FavoriteItemModel = FavoriteItemModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.FavoriteItemModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.FavoriteItemModel.fetchById(id, withRelated);
        });
    }
    /**
     * search favorite item by profile id and item id
     * @param options, FavoriteSearchParams
     * @returns {Promise<FavoriteItem> }
     */
    search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.FavoriteItemModel.search(options);
        });
    }
    findFavoritesByProfileId(profileId, withRelated) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.FavoriteItemModel.findFavoritesByProfileId(profileId, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const favoriteItem = this.FavoriteItemModel.forge(data);
            try {
                const favoriteItemCreated = yield favoriteItem.save();
                return this.FavoriteItemModel.fetchById(favoriteItemCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the favoriteItem!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const favoriteItem = this.FavoriteItemModel.forge({ id });
            try {
                const favoriteItemUpdated = yield favoriteItem.save(data, { patch: true });
                return this.FavoriteItemModel.fetchById(favoriteItemUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the favoriteItem!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let favoriteItem = this.FavoriteItemModel.forge({ id });
            try {
                favoriteItem = yield favoriteItem.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield favoriteItem.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the favoriteItem!', error);
            }
        });
    }
};
FavoriteItemRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.FavoriteItem)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], FavoriteItemRepository);
exports.FavoriteItemRepository = FavoriteItemRepository;
//# sourceMappingURL=FavoriteItemRepository.js.map