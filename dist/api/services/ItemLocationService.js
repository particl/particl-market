"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ItemLocationRepository_1 = require("../repositories/ItemLocationRepository");
const ItemLocationCreateRequest_1 = require("../requests/ItemLocationCreateRequest");
const ItemLocationUpdateRequest_1 = require("../requests/ItemLocationUpdateRequest");
const LocationMarkerService_1 = require("./LocationMarkerService");
let ItemLocationService = class ItemLocationService {
    constructor(locationMarkerService, itemLocationRepo, Logger) {
        this.locationMarkerService = locationMarkerService;
        this.itemLocationRepo = itemLocationRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemLocationRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemLocation = yield this.itemLocationRepo.findOne(id, withRelated);
            if (itemLocation === null) {
                this.log.warn(`ItemLocation with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return itemLocation;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // extract and remove related models from request
            const locationMarker = body.locationMarker;
            delete body.locationMarker;
            // If the request body was valid we will create the itemLocation
            const itemLocation = yield this.itemLocationRepo.create(body);
            // create related models
            if (!_.isEmpty(locationMarker)) {
                locationMarker.item_location_id = itemLocation.Id;
                yield this.locationMarkerService.create(locationMarker);
            }
            // finally find and return the created itemLocation
            return yield this.findOne(itemLocation.Id);
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            const locationMarker = body.locationMarker;
            delete body.locationMarker;
            // find the existing one without related
            const itemLocation = yield this.findOne(id, false);
            // set new values
            itemLocation.Region = body.region;
            itemLocation.Address = body.address;
            // update itemLocation record
            const updatedItemLocation = yield this.itemLocationRepo.update(id, itemLocation.toJSON());
            // update related locationMarker
            const existingLocationMarker = updatedItemLocation.related('LocationMarker').toJSON();
            if (!_.isEmpty(locationMarker) && !_.isEmpty(existingLocationMarker)) {
                // we have new locationMarker and existingLocationMarker -> update with new data
                locationMarker.item_location_id = id;
                yield this.locationMarkerService.update(existingLocationMarker.id, locationMarker);
            }
            else if (!_.isEmpty(locationMarker) && _.isEmpty(existingLocationMarker)) {
                // we have new locationMarker but no existingLocationMarker -> create new
                locationMarker.item_location_id = id;
                yield this.locationMarkerService.create(locationMarker);
            }
            else if (_.isEmpty(locationMarker) && !_.isEmpty(existingLocationMarker)) {
                // we have no new locationMarker and existingLocationMarker -> remove existing
                yield this.locationMarkerService.destroy(existingLocationMarker.id);
            }
            // finally find and return the updated itemLocation
            return yield this.findOne(id);
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.itemLocationRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ItemLocationCreateRequest_1.ItemLocationCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ItemLocationCreateRequest_1.ItemLocationCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemLocationService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ItemLocationUpdateRequest_1.ItemLocationUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ItemLocationUpdateRequest_1.ItemLocationUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemLocationService.prototype, "update", null);
ItemLocationService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.LocationMarkerService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Repository.ItemLocationRepository)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [LocationMarkerService_1.LocationMarkerService,
        ItemLocationRepository_1.ItemLocationRepository, Object])
], ItemLocationService);
exports.ItemLocationService = ItemLocationService;
//# sourceMappingURL=ItemLocationService.js.map