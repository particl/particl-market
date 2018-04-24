"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ValidationException_1 = require("../exceptions/ValidationException");
const ListingItemObjectRepository_1 = require("../repositories/ListingItemObjectRepository");
const ListingItemObjectCreateRequest_1 = require("../requests/ListingItemObjectCreateRequest");
const ListingItemObjectUpdateRequest_1 = require("../requests/ListingItemObjectUpdateRequest");
const ListingItemObjectSearchParams_1 = require("../requests/ListingItemObjectSearchParams");
const ListingItemObjectDataService_1 = require("./ListingItemObjectDataService");
let ListingItemObjectService = class ListingItemObjectService {
    constructor(listingItemObjectDataService, listingItemObjectRepo, Logger) {
        this.listingItemObjectDataService = listingItemObjectDataService;
        this.listingItemObjectRepo = listingItemObjectRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.listingItemObjectRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemObject = yield this.listingItemObjectRepo.findOne(id, withRelated);
            if (listingItemObject === null) {
                this.log.warn(`ListingItemObject with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return listingItemObject;
        });
    }
    /**
     * search ListingItemObject using given ListingItemObjectSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItemObject>>}
     */
    search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.listingItemObjectRepo.search(options);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // todo: could this be annotated in ListingItemObjectCreateRequest?
            if (body.listing_item_id == null && body.listing_item_template_id == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
            }
            // extract and remove related models from request
            const listingItemObjectDatas = body.listingItemObjectDatas || [];
            delete body.listingItemObjectDatas;
            // If the request body was valid we will create the listingItemObject
            const listingItemObject = yield this.listingItemObjectRepo.create(body);
            for (const objectData of listingItemObjectDatas) {
                objectData.listing_item_object_id = listingItemObject.Id;
                yield this.listingItemObjectDataService.create(objectData);
            }
            // finally find and return the created listingItemObject
            const newListingItemObject = yield this.findOne(listingItemObject.id);
            return newListingItemObject;
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // todo: messy
            if (body.listing_item_id == null && body.listing_item_template_id == null) {
                throw new ValidationException_1.ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
            }
            // find the existing one without relatedb
            const listingItemObject = yield this.findOne(id, false);
            // set new values
            listingItemObject.Type = body.type;
            listingItemObject.Description = body.description;
            listingItemObject.Order = body.order;
            // update listingItemObjectDatas
            const listingItemObjectJSON = listingItemObject.toJSON();
            const listingItemObjectDatasOld = listingItemObjectJSON.ListingItemObjectDatas || [];
            const objectDataIds = [];
            for (const objectData of listingItemObjectDatasOld) {
                objectDataIds.push(objectData.id);
            }
            for (const objectDataId of objectDataIds) {
                yield this.listingItemObjectDataService.destroy(objectDataId);
            }
            const listingItemObjectDatas = body.listingItemObjectDatas || [];
            for (const objectData of listingItemObjectDatas) {
                objectData.listing_item_object_id = listingItemObject.Id;
                yield this.listingItemObjectDataService.create(objectData);
            }
            // update listingItemObject record
            const updatedListingItemObject = yield this.listingItemObjectRepo.update(id, listingItemObject.toJSON());
            return updatedListingItemObject;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.listingItemObjectRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemObjectSearchParams_1.ListingItemObjectSearchParams)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemObjectSearchParams_1.ListingItemObjectSearchParams]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemObjectService.prototype, "search", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemObjectCreateRequest_1.ListingItemObjectCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemObjectCreateRequest_1.ListingItemObjectCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemObjectService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ListingItemObjectUpdateRequest_1.ListingItemObjectUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ListingItemObjectUpdateRequest_1.ListingItemObjectUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemObjectService.prototype, "update", null);
ListingItemObjectService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ListingItemObjectDataService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Repository.ListingItemObjectRepository)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ListingItemObjectDataService_1.ListingItemObjectDataService,
        ListingItemObjectRepository_1.ListingItemObjectRepository, Object])
], ListingItemObjectService);
exports.ListingItemObjectService = ListingItemObjectService;
//# sourceMappingURL=ListingItemObjectService.js.map