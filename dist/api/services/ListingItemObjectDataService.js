"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ListingItemObjectDataRepository_1 = require("../repositories/ListingItemObjectDataRepository");
const ListingItemObjectDataCreateRequest_1 = require("../requests/ListingItemObjectDataCreateRequest");
const ListingItemObjectDataUpdateRequest_1 = require("../requests/ListingItemObjectDataUpdateRequest");
let ListingItemObjectDataService = class ListingItemObjectDataService {
    constructor(listingItemObjectDataRepo, Logger) {
        this.listingItemObjectDataRepo = listingItemObjectDataRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.listingItemObjectDataRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemObjectData = yield this.listingItemObjectDataRepo.findOne(id, withRelated);
            if (listingItemObjectData === null) {
                this.log.warn(`ListingItemObjectData with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return listingItemObjectData;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the listingItemObjectData
            const listingItemObjectData = yield this.listingItemObjectDataRepo.create(body);
            const newListingItemObjectData = yield this.findOne(listingItemObjectData.id);
            return newListingItemObjectData;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const listingItemObjectData = yield this.findOne(id, false);
            // set new values
            listingItemObjectData.Key = body.key;
            listingItemObjectData.Value = body.value;
            // update listingItemObjectData record
            const updatedListingItemObjectData = yield this.listingItemObjectDataRepo.update(id, listingItemObjectData.toJSON());
            return updatedListingItemObjectData;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.listingItemObjectDataRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemObjectDataCreateRequest_1.ListingItemObjectDataCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemObjectDataCreateRequest_1.ListingItemObjectDataCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemObjectDataService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ListingItemObjectDataUpdateRequest_1.ListingItemObjectDataUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ListingItemObjectDataUpdateRequest_1.ListingItemObjectDataUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemObjectDataService.prototype, "update", null);
ListingItemObjectDataService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ListingItemObjectDataRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ListingItemObjectDataRepository_1.ListingItemObjectDataRepository, Object])
], ListingItemObjectDataService);
exports.ListingItemObjectDataService = ListingItemObjectDataService;
//# sourceMappingURL=ListingItemObjectDataService.js.map