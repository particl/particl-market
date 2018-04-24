"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ListingItemTemplateRepository = class ListingItemTemplateRepository {
    constructor(ListingItemTemplateModel, Logger) {
        this.ListingItemTemplateModel = ListingItemTemplateModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ListingItemTemplateModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ListingItemTemplateModel.fetchById(id, withRelated);
        });
    }
    /**
     *
     * @param {string} hash
     * @param {boolean} withRelated
     * @returns {Promise<ListingItemTemplate>}
     */
    findOneByHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ListingItemTemplateModel.fetchByHash(hash, withRelated);
        });
    }
    /**
     * todo: optionally fetch withRelated
     *
     * @param options, ListingItemSearchParams
     * @returns {Promise<Bookshelf.Collection<ListingItemTemplate>>}
     */
    search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ListingItemTemplateModel.searchBy(options);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemTemplate = this.ListingItemTemplateModel.forge(data);
            try {
                const listingItemTemplateCreated = yield listingItemTemplate.save();
                return this.ListingItemTemplateModel.fetchById(listingItemTemplateCreated.id);
            }
            catch (error) {
                this.log.error('error: ', error);
                throw new DatabaseException_1.DatabaseException('Could not create the listingItemTemplate!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemTemplate = this.ListingItemTemplateModel.forge({ id });
            try {
                const listingItemTemplateUpdated = yield listingItemTemplate.save(data, { patch: true });
                return this.ListingItemTemplateModel.fetchById(listingItemTemplateUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the listingItemTemplate!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let listingItemTemplate = this.ListingItemTemplateModel.forge({ id });
            try {
                listingItemTemplate = yield listingItemTemplate.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield listingItemTemplate.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the listingItemTemplate!', error);
            }
        });
    }
};
ListingItemTemplateRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ListingItemTemplate)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ListingItemTemplateRepository);
exports.ListingItemTemplateRepository = ListingItemTemplateRepository;
//# sourceMappingURL=ListingItemTemplateRepository.js.map