"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ListingItemObjectDataRepository = class ListingItemObjectDataRepository {
    constructor(ListingItemObjectDataModel, Logger) {
        this.ListingItemObjectDataModel = ListingItemObjectDataModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ListingItemObjectDataModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ListingItemObjectDataModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemObjectData = this.ListingItemObjectDataModel.forge(data);
            try {
                const listingItemObjectDataCreated = yield listingItemObjectData.save();
                return this.ListingItemObjectDataModel.fetchById(listingItemObjectDataCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the listingItemObjectData!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemObjectData = this.ListingItemObjectDataModel.forge({ id });
            try {
                const listingItemObjectDataUpdated = yield listingItemObjectData.save(data, { patch: true });
                return this.ListingItemObjectDataModel.fetchById(listingItemObjectDataUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the listingItemObjectData!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let listingItemObjectData = this.ListingItemObjectDataModel.forge({ id });
            try {
                listingItemObjectData = yield listingItemObjectData.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield listingItemObjectData.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the listingItemObjectData!', error);
            }
        });
    }
};
ListingItemObjectDataRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ListingItemObjectData)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ListingItemObjectDataRepository);
exports.ListingItemObjectDataRepository = ListingItemObjectDataRepository;
//# sourceMappingURL=ListingItemObjectDataRepository.js.map