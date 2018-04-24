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
let AddressUpdateCommand = class AddressUpdateCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, addressService) {
        super(CommandEnumType_1.Commands.ADDRESS_UPDATE);
        this.Logger = Logger;
        this.addressService = addressService;
        this.log = new Logger(__filename);
    }
    /**
     *
     * data.params[]:
     *  [0]: address id
     *  [1]: firstName
     *  [2]: lastName
     *  [3]: title
     *  [4]: addressLine1
     *  [5]: addressLine2
     *  [6]: city
     *  [7]: state
     *  [8]: country/countryCode
     *  [9]: zipCode
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Address>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If countryCode is country, convert to countryCode.
            // If countryCode is country code, validate, and possibly throw error.
            let countryCode = data.params[8];
            countryCode = ShippingCountries_1.ShippingCountries.validate(this.log, countryCode);
            // Validate ZIP code
            const zipCodeStr = data.params[9];
            if (!ShippingZips_1.ShippingZips.validate(countryCode, zipCodeStr)) {
                throw new NotFoundException_1.NotFoundException('ZIP/postal-code, country code, combination not valid.');
            }
            return this.addressService.update(data.params[0], {
                firstName: data.params[1],
                lastName: data.params[2],
                title: data.params[3],
                addressLine1: data.params[4],
                addressLine2: data.params[5],
                city: data.params[6],
                state: data.params[7],
                country: countryCode,
                zipCode: zipCodeStr
            });
        });
    }
    // tslint:disable:max-line-length
    usage() {
        return this.getName() + ' <addressId> <firstName> <lastName> <title> <addressLine1> <addressLine2> <city> <state> (<countryName>|<countryCode>) [<zip>] ';
    }
    // tslint:enable:max-line-length
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <addressId>              - Numeric - The ID of the address we want to modify. \n'
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
        return 'Update the details of an address given by ID.';
    }
    example() {
        return 'address 1 ' + this.getName() + 'johnny \' deep \' homeAddress \'1060 West Addison Street\' \'\' Chicago IL \'United States\' 60613 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], AddressUpdateCommand.prototype, "execute", null);
AddressUpdateCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.AddressService)),
    tslib_1.__metadata("design:paramtypes", [Object, AddressService_1.AddressService])
], AddressUpdateCommand);
exports.AddressUpdateCommand = AddressUpdateCommand;
//# sourceMappingURL=AddressUpdateCommand.js.map