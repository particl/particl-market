"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ProfileRepository_1 = require("../repositories/ProfileRepository");
const ProfileCreateRequest_1 = require("../requests/ProfileCreateRequest");
const ProfileUpdateRequest_1 = require("../requests/ProfileUpdateRequest");
const AddressService_1 = require("./AddressService");
const CryptocurrencyAddressService_1 = require("./CryptocurrencyAddressService");
const CoreRpcService_1 = require("./CoreRpcService");
const ShoppingCartService_1 = require("./ShoppingCartService");
let ProfileService = class ProfileService {
    constructor(addressService, cryptocurrencyAddressService, shoppingCartService, profileRepo, coreRpcService, Logger) {
        this.addressService = addressService;
        this.cryptocurrencyAddressService = cryptocurrencyAddressService;
        this.shoppingCartService = shoppingCartService;
        this.profileRepo = profileRepo;
        this.coreRpcService = coreRpcService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    getDefault(withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileRepo.getDefault(withRelated);
            if (profile === null) {
                this.log.warn(`Default Profile was not found!`);
                throw new NotFoundException_1.NotFoundException('DEFAULT');
            }
            return profile;
        });
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.profileRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileRepo.findOne(id, withRelated);
            if (profile === null) {
                this.log.warn(`Profile with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return profile;
        });
    }
    findOneByName(name, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileRepo.findOneByName(name, withRelated);
            return profile;
        });
    }
    findOneByAddress(name, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileRepo.findOneByAddress(name, withRelated);
            return profile;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            if (!body.address) {
                body.address = yield this.getNewAddress();
            }
            // extract and remove related models from request
            const shippingAddresses = body.shippingAddresses || [];
            delete body.shippingAddresses;
            const cryptocurrencyAddresses = body.cryptocurrencyAddresses || [];
            delete body.cryptocurrencyAddresses;
            // If the request body was valid we will create the profile
            const profile = yield this.profileRepo.create(body);
            // then create related models
            for (const address of shippingAddresses) {
                address.profile_id = profile.Id;
                yield this.addressService.create(address);
            }
            for (const cryptoAddress of cryptocurrencyAddresses) {
                cryptoAddress.profile_id = profile.Id;
                yield this.cryptocurrencyAddressService.create(cryptoAddress);
            }
            const shoppingCartData = {
                name: 'DEFAULT',
                profile_id: profile.Id
            };
            // create default shoppingCart
            const defaultShoppingCart = yield this.shoppingCartService.create(shoppingCartData);
            // finally find and return the created profileId
            const newProfile = yield this.findOne(profile.Id);
            return newProfile;
        });
    }
    getNewAddress() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const newAddress = yield this.coreRpcService.getNewAddress()
                .then((res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.info('Successfully created new address for profile: ' + res);
                return res;
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.warn('Could not create new address for profile: ' + reason);
                return 'ERROR_NO_ADDRESS';
            }));
            this.log.debug('new address: ', newAddress);
            return newAddress;
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // find the existing one without related
            const profile = yield this.findOne(id, false);
            // set new values
            profile.Name = body.name;
            // update address only if its set
            if (body.address) {
                profile.Address = body.address;
            }
            // update profile
            const updatedProfile = yield this.profileRepo.update(id, profile.toJSON());
            this.log.debug('updatedProfile: ', updatedProfile.toJSON());
            // remove existing addresses
            const addressesToDelete = profile.toJSON().ShippingAddresses || [];
            for (const address of addressesToDelete) {
                yield this.addressService.destroy(address.id);
            }
            // update related data
            const shippingAddresses = body.shippingAddresses || [];
            // add new addresses
            for (const address of shippingAddresses) {
                address.profile_id = id;
                yield this.addressService.create(address);
            }
            const cryptocurrencyAddresses = body.cryptocurrencyAddresses || [];
            for (const cryptoAddress of cryptocurrencyAddresses) {
                if (cryptoAddress.profile_id) {
                    yield this.cryptocurrencyAddressService.update(cryptoAddress.id, cryptoAddress);
                }
                else {
                    cryptoAddress.profile_id = id;
                    yield this.cryptocurrencyAddressService.create(cryptoAddress);
                }
            }
            // finally find and return the updated itemInformation
            const newProfile = yield this.findOne(id);
            return newProfile;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.profileRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ProfileCreateRequest_1.ProfileCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ProfileCreateRequest_1.ProfileCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ProfileUpdateRequest_1.ProfileUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileService.prototype, "update", null);
ProfileService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.AddressService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.CryptocurrencyAddressService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ShoppingCartService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Repository.ProfileRepository)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(5, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [AddressService_1.AddressService,
        CryptocurrencyAddressService_1.CryptocurrencyAddressService,
        ShoppingCartService_1.ShoppingCartService,
        ProfileRepository_1.ProfileRepository,
        CoreRpcService_1.CoreRpcService, Object])
], ProfileService);
exports.ProfileService = ProfileService;
//# sourceMappingURL=ProfileService.js.map