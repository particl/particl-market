"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const CryptocurrencyAddressRepository_1 = require("../repositories/CryptocurrencyAddressRepository");
const CryptocurrencyAddressCreateRequest_1 = require("../requests/CryptocurrencyAddressCreateRequest");
const CryptocurrencyAddressUpdateRequest_1 = require("../requests/CryptocurrencyAddressUpdateRequest");
let CryptocurrencyAddressService = class CryptocurrencyAddressService {
    constructor(cryptocurrencyAddressRepo, Logger) {
        this.cryptocurrencyAddressRepo = cryptocurrencyAddressRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.cryptocurrencyAddressRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cryptocurrencyAddress = yield this.cryptocurrencyAddressRepo.findOne(id, withRelated);
            if (cryptocurrencyAddress === null) {
                this.log.warn(`CryptocurrencyAddress with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return cryptocurrencyAddress;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the cryptocurrencyAddress
            const cryptocurrencyAddress = yield this.cryptocurrencyAddressRepo.create(body).catch(e => {
                this.log.error('CryptocurrencyAddressService.create(): ', e);
                throw e;
            });
            // finally find and return the created cryptocurrencyAddress
            return yield this.findOne(cryptocurrencyAddress.Id);
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const cryptocurrencyAddress = yield this.findOne(id, false);
            // set new values
            cryptocurrencyAddress.Type = body.type;
            cryptocurrencyAddress.Address = body.address;
            // update cryptocurrencyAddress record
            return yield this.cryptocurrencyAddressRepo.update(id, cryptocurrencyAddress.toJSON());
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.cryptocurrencyAddressRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(CryptocurrencyAddressCreateRequest_1.CryptocurrencyAddressCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [CryptocurrencyAddressCreateRequest_1.CryptocurrencyAddressCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], CryptocurrencyAddressService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(CryptocurrencyAddressUpdateRequest_1.CryptocurrencyAddressUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, CryptocurrencyAddressUpdateRequest_1.CryptocurrencyAddressUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], CryptocurrencyAddressService.prototype, "update", null);
CryptocurrencyAddressService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.CryptocurrencyAddressRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [CryptocurrencyAddressRepository_1.CryptocurrencyAddressRepository, Object])
], CryptocurrencyAddressService);
exports.CryptocurrencyAddressService = CryptocurrencyAddressService;
//# sourceMappingURL=CryptocurrencyAddressService.js.map