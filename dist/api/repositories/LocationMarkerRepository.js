"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let LocationMarkerRepository = class LocationMarkerRepository {
    constructor(LocationMarkerModel, Logger) {
        this.LocationMarkerModel = LocationMarkerModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.LocationMarkerModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.LocationMarkerModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const locationMarker = this.LocationMarkerModel.forge(data);
            try {
                const locationMarkerCreated = yield locationMarker.save();
                return this.LocationMarkerModel.fetchById(locationMarkerCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the locationMarker!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const locationMarker = this.LocationMarkerModel.forge({ id });
            try {
                const locationMarkerUpdated = yield locationMarker.save(data, { patch: true });
                return this.LocationMarkerModel.fetchById(locationMarkerUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the locationMarker!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let locationMarker = this.LocationMarkerModel.forge({ id });
            try {
                locationMarker = yield locationMarker.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield locationMarker.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the locationMarker!', error);
            }
        });
    }
};
LocationMarkerRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.LocationMarker)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], LocationMarkerRepository);
exports.LocationMarkerRepository = LocationMarkerRepository;
//# sourceMappingURL=LocationMarkerRepository.js.map