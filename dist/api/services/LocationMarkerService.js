"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const LocationMarkerRepository_1 = require("../repositories/LocationMarkerRepository");
const LocationMarkerCreateRequest_1 = require("../requests/LocationMarkerCreateRequest");
const LocationMarkerUpdateRequest_1 = require("../requests/LocationMarkerUpdateRequest");
let LocationMarkerService = class LocationMarkerService {
    constructor(locationMarkerRepo, Logger) {
        this.locationMarkerRepo = locationMarkerRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.locationMarkerRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const locationMarker = yield this.locationMarkerRepo.findOne(id, withRelated);
            if (locationMarker === null) {
                this.log.warn(`LocationMarker with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return locationMarker;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the locationMarker
            const locationMarker = yield this.locationMarkerRepo.create(body);
            // finally find and return the created locationMarker
            return yield this.findOne(locationMarker.Id);
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const locationMarker = yield this.findOne(id, false);
            // set new values
            locationMarker.MarkerTitle = body.markerTitle;
            locationMarker.MarkerText = body.markerText;
            locationMarker.Lat = body.lat;
            locationMarker.Lng = body.lng;
            // update locationMarker record
            const updatedLocationMarker = yield this.locationMarkerRepo.update(id, locationMarker.toJSON());
            return updatedLocationMarker;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.locationMarkerRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(LocationMarkerCreateRequest_1.LocationMarkerCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [LocationMarkerCreateRequest_1.LocationMarkerCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], LocationMarkerService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(LocationMarkerUpdateRequest_1.LocationMarkerUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, LocationMarkerUpdateRequest_1.LocationMarkerUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], LocationMarkerService.prototype, "update", null);
LocationMarkerService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.LocationMarkerRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [LocationMarkerRepository_1.LocationMarkerRepository, Object])
], LocationMarkerService);
exports.LocationMarkerService = LocationMarkerService;
//# sourceMappingURL=LocationMarkerService.js.map