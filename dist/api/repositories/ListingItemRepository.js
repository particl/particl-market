"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ListingItemRepository = class ListingItemRepository {
    constructor(ListingItemModel, Logger) {
        this.ListingItemModel = ListingItemModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ListingItemModel.fetchAll();
            return list;
        });
    }
    findByCategory(categoryId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.ListingItemModel.fetchByCategory(categoryId, withRelated);
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ListingItemModel.fetchById(id, withRelated);
        });
    }
    /**
     *
     * @param {string} hash
     * @param {boolean} withRelated
     * @returns {Promise<ListingItem>}
     */
    findOneByHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ListingItemModel.fetchByHash(hash, withRelated);
        });
    }
    /**
     *
     * @param {ListingItemSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<ListingItem>>}
     */
    search(options, withRelated) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ListingItemModel.searchBy(options, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItem = this.ListingItemModel.forge(data);
            try {
                const listingItemCreated = yield listingItem.save();
                return this.ListingItemModel.fetchById(listingItemCreated.id);
            }
            catch (error) {
                this.log.error(error);
                throw new DatabaseException_1.DatabaseException('Could not create the listingItem!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItem = this.ListingItemModel.forge({ id });
            try {
                const listingItemUpdated = yield listingItem.save(data, { patch: true });
                return this.ListingItemModel.fetchById(listingItemUpdated.id);
            }
            catch (error) {
                this.log.error(error);
                throw new DatabaseException_1.DatabaseException('Could not update the listingItem!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let listingItem = this.ListingItemModel.forge({ id });
            try {
                listingItem = yield listingItem.fetch({ require: true });
            }
            catch (error) {
                this.log.error(error);
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield listingItem.destroy();
                return;
            }
            catch (error) {
                this.log.error(error);
                throw new DatabaseException_1.DatabaseException('Could not delete the listingItem!', error);
            }
        });
    }
};
ListingItemRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ListingItem)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ListingItemRepository);
exports.ListingItemRepository = ListingItemRepository;
//# sourceMappingURL=ListingItemRepository.js.map