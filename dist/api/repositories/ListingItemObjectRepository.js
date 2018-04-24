"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ListingItemObjectRepository = class ListingItemObjectRepository {
    constructor(ListingItemObjectModel, Logger) {
        this.ListingItemObjectModel = ListingItemObjectModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ListingItemObjectModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ListingItemObjectModel.fetchById(id, withRelated);
        });
    }
    /**
     *
     * @param options, ListingItemObjectSearchParams
     * @returns {Promise<Bookshelf.Collection<ListingItemObject>>}
     */
    search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ListingItemObjectModel.searchBy(options);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemObject = this.ListingItemObjectModel.forge(data);
            try {
                const listingItemObjectCreated = yield listingItemObject.save();
                return this.ListingItemObjectModel.fetchById(listingItemObjectCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the listingItemObject!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemObject = this.ListingItemObjectModel.forge({ id });
            try {
                const listingItemObjectUpdated = yield listingItemObject.save(data, { patch: true });
                return this.ListingItemObjectModel.fetchById(listingItemObjectUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the listingItemObject!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let listingItemObject = this.ListingItemObjectModel.forge({ id });
            try {
                listingItemObject = yield listingItemObject.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield listingItemObject.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the listingItemObject!', error);
            }
        });
    }
};
ListingItemObjectRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ListingItemObject)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ListingItemObjectRepository);
exports.ListingItemObjectRepository = ListingItemObjectRepository;
//# sourceMappingURL=ListingItemObjectRepository.js.map