"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ShippingDestinationRepository_1 = require("../repositories/ShippingDestinationRepository");
const ShippingDestinationCreateRequest_1 = require("../requests/ShippingDestinationCreateRequest");
const ShippingDestinationUpdateRequest_1 = require("../requests/ShippingDestinationUpdateRequest");
const ShippingDestinationSearchParams_1 = require("../requests/ShippingDestinationSearchParams");
let ShippingDestinationService = class ShippingDestinationService {
    constructor(shippingDestinationRepo, Logger) {
        this.shippingDestinationRepo = shippingDestinationRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.shippingDestinationRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shippingDestination = yield this.shippingDestinationRepo.findOne(id, withRelated);
            if (shippingDestination === null) {
                this.log.warn(`ShippingDestination with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return shippingDestination;
        });
    }
    /**
     * options:
     *  item_information_id: options.item_information_id
     *  country: options.options
     *  shipping_availability: options.shipping_availability
     *
     * @param options
     * @returns {Promise<ShippingDestination>}
     */
    search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.shippingDestinationRepo.search(options);
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the shippingDestination
            const shippingDestination = yield this.shippingDestinationRepo.create(body);
            // finally find and return the created shippingDestination
            const newShippingDestination = yield this.findOne(shippingDestination.id);
            return newShippingDestination;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const shippingDestination = yield this.findOne(id, false);
            // set new values
            shippingDestination.Country = body.country;
            shippingDestination.ShippingAvailability = body.shippingAvailability;
            // update shippingDestination record
            const updatedShippingDestination = yield this.shippingDestinationRepo.update(id, shippingDestination.toJSON());
            return updatedShippingDestination;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.shippingDestinationRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ShippingDestinationCreateRequest_1.ShippingDestinationCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ShippingDestinationSearchParams_1.ShippingDestinationSearchParams]),
    tslib_1.__metadata("design:returntype", Promise)
], ShippingDestinationService.prototype, "search", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ShippingDestinationCreateRequest_1.ShippingDestinationCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ShippingDestinationCreateRequest_1.ShippingDestinationCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShippingDestinationService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ShippingDestinationUpdateRequest_1.ShippingDestinationUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ShippingDestinationUpdateRequest_1.ShippingDestinationUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShippingDestinationService.prototype, "update", null);
ShippingDestinationService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ShippingDestinationRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ShippingDestinationRepository_1.ShippingDestinationRepository, Object])
], ShippingDestinationService);
exports.ShippingDestinationService = ShippingDestinationService;
//# sourceMappingURL=ShippingDestinationService.js.map