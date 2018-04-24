"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const AddressService_1 = require("../../services/AddressService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const ShippingCountries_1 = require("../../../core/helpers/ShippingCountries");
const ShippingZips_1 = require("../../../core/helpers/ShippingZips");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
const NotFoundException_1 = require("../../exceptions/NotFoundException");
const AddressType_1 = require("../../enums/AddressType");
let AddressAddCommand = class AddressAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, addressService) {
        super(CommandEnumType_1.Commands.ADDRESS_ADD);
        this.Logger = Logger;
        this.addressService = addressService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: firstName
     *  [2]: lastName
     *  [3]: title
     *  [4]: addressLine1
     *  [5]: addressLine2
     *  [6]: city
     *  [7]: state
     *  [8]: country/countryCode
     *  [9]: zipCode
     *  [10]: type, optional, default: AddressType.SHIPPING_OWN
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Address>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Attempting to create address');
            this.log.debug('data.params:', JSON.stringify(data.params, null, 2));
            // If countryCode is country, convert to countryCode.
            // If countryCode is country code, validate, and possibly throw error.
            let countryCode = data.params[8];
            countryCode = ShippingCountries_1.ShippingCountries.validate(this.log, countryCode);
            this.log.debug('countryCode:', countryCode);
            // Validate ZIP code
            const zipCodeStr = data.params[9];
            if (!ShippingZips_1.ShippingZips.validate(countryCode, zipCodeStr)) {
                throw new NotFoundException_1.NotFoundException('ZIP/postal-code, country code, combination not valid.');
            }
            this.log.debug('zipCodeStr:', zipCodeStr);
            const newAddress = {
                profile_id: data.params[0],
                firstName: data.params[1],
                lastName: data.params[2],
                title: data.params[3],
                addressLine1: data.params[4],
                addressLine2: data.params[5],
                city: data.params[6],
                state: data.params[7],
                country: countryCode,
                zipCode: zipCodeStr,
                type: data.params[10] ? data.params[10] : AddressType_1.AddressType.SHIPPING_OWN
            };
            this.log.debug('newAddress:', newAddress);
            return yield this.addressService.create(newAddress);
        });
    }
    // TODO: title should be after profileId
    // tslint:disable:max-line-length
    usage() {
        return this.getName() + ' <profileId> <firstName> <lastName> <title> <addressLine1> <addressLine2> <city> <state> (<countryName>|<countryCode>) [<zip>] ';
    }
    // tslint:enable:max-line-length
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - Numeric - The ID of the profile we want to associate \n'
            + '                                this address with. \n'
            + '    <firstName>              - String - First Name of user. \n'
            + '    <lastName>               - String - Last Name of user. \n'
            + '    <title>                  - String - A short identifier for the address. \n'
            + '    <addressLine1>           - String - The first line of the address. \n'
            + '    <addressLine2>           - String - The second line of the address. \n'
            + '    <city>                   - String - The city of the address. \n'
            + '    <state>                  - String - The state of the address. \n'
            + '    <country>                - String - The country name of the address. \n'
            + '    <countryCode>            - String - Two letter country code of the address. \n'
            + '    <zip>                    - String - The ZIP code of your address. ';
    }
    description() {
        return 'Create an address and associate it with a profile.';
    }
    example() {
        return 'address ' + this.getName() + ' 1 \'Johnny\' \'Deep\' myLocation \'123 Fake St\' \'\' Springfield NT \'United States\' 90701';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], AddressAddCommand.prototype, "execute", null);
AddressAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.AddressService)),
    tslib_1.__metadata("design:paramtypes", [Object, AddressService_1.AddressService])
], AddressAddCommand);
exports.AddressAddCommand = AddressAddCommand;
//# sourceMappingURL=AddressAddCommand.js.map