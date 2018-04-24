"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const AddressRepository_1 = require("../repositories/AddressRepository");
const AddressCreateRequest_1 = require("../requests/AddressCreateRequest");
const AddressUpdateRequest_1 = require("../requests/AddressUpdateRequest");
let AddressService = class AddressService {
    constructor(addressRepo, Logger) {
        this.addressRepo = addressRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.addressRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const address = yield this.addressRepo.findOne(id, withRelated);
            if (address === null) {
                this.log.warn(`Address with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return address;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo: should propably validate country here
            // this.log.debug('create Address, body: ', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the address
            const address = yield this.addressRepo.create(body);
            // finally find and return the created addressId
            const newAddress = yield this.findOne(address.Id);
            return newAddress;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const address = yield this.findOne(id, false);
            // set new values
            address.Title = body.title;
            address.FirstName = body.firstName;
            address.LastName = body.lastName;
            address.AddressLine1 = body.addressLine1;
            address.AddressLine2 = body.addressLine2;
            address.ZipCode = body.zipCode;
            address.City = body.city;
            address.State = body.state;
            address.Country = body.country;
            // update address record
            const updatedAddress = yield this.addressRepo.update(id, address.toJSON());
            return updatedAddress;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('removing address:', id);
            return yield this.addressRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(AddressCreateRequest_1.AddressCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [AddressCreateRequest_1.AddressCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], AddressService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(AddressUpdateRequest_1.AddressUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, AddressUpdateRequest_1.AddressUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], AddressService.prototype, "update", null);
AddressService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.AddressRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [AddressRepository_1.AddressRepository, Object])
], AddressService);
exports.AddressService = AddressService;
//# sourceMappingURL=AddressService.js.map