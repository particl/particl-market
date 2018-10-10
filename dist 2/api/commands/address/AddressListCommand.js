"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const AddressService_1 = require("../../services/AddressService");
const ProfileService_1 = require("../../services/ProfileService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const AddressType_1 = require("../../enums/AddressType");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
let AddressListCommand = class AddressListCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, addressService, profileService) {
        super(CommandEnumType_1.Commands.ADDRESS_LIST);
        this.Logger = Logger;
        this.addressService = addressService;
        this.profileService = profileService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: type, optional, default: AddressType.SHIPPING_OWN
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<Address>>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profileId = data.params[0];
            if (!profileId) {
                throw new Error('No profileId for a command');
            }
            const profile = yield this.profileService.findOne(profileId, true);
            const type = data.params[1] ? data.params[1] : AddressType_1.AddressType.SHIPPING_OWN;
            // Return SHIPPING_OWN addresses by default
            return profile.toJSON().ShippingAddresses.filter((address) => address.type === type);
        });
    }
    usage() {
        return this.getName() + ' [<profileId>] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - Numeric - The ID of the profile we want to associate \n'
            + '                                this address with. ';
    }
    description() {
        return 'List all addresses belonging to a profile.';
    }
    example() {
        return 'address ' + this.getName() + ' 1';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], AddressListCommand.prototype, "execute", null);
AddressListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.AddressService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__metadata("design:paramtypes", [Object, AddressService_1.AddressService,
        ProfileService_1.ProfileService])
], AddressListCommand);
exports.AddressListCommand = AddressListCommand;
//# sourceMappingURL=AddressListCommand.js.map