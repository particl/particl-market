"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const RpcRequest_1 = require("../../requests/RpcRequest");
const AddressService_1 = require("../../services/AddressService");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
let AddressRemoveCommand = class AddressRemoveCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, addressService) {
        super(CommandEnumType_1.Commands.ADDRESS_REMOVE);
        this.Logger = Logger;
        this.addressService = addressService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: address id
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.addressService.destroy(data.params[0]);
        });
    }
    usage() {
        return this.getName() + ' <addressId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <addressId>              - The ID of the address we want to remove and destroy. ';
    }
    description() {
        return 'Remove and destroy an address via ID.';
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
], AddressRemoveCommand.prototype, "execute", null);
AddressRemoveCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.AddressService)),
    tslib_1.__metadata("design:paramtypes", [Object, AddressService_1.AddressService])
], AddressRemoveCommand);
exports.AddressRemoveCommand = AddressRemoveCommand;
//# sourceMappingURL=AddressRemoveCommand.js.map