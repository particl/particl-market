"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ProfileService_1 = require("../../services/ProfileService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
let ProfileAddCommand = class ProfileAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, profileService) {
        super(CommandEnumType_1.Commands.PROFILE_ADD);
        this.Logger = Logger;
        this.profileService = profileService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: profile name
     *  [1]: profile address
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileService.findOneByName(data.params[0]);
            // check if profile already exist for the given name
            if (profile !== null) {
                throw new MessageException_1.MessageException(`Profile already exist for the given name = ${data.params[0]}`);
            }
            // create profile
            return this.profileService.create({
                name: data.params[0],
                address: (data.params[1] || null)
            });
        });
    }
    usage() {
        return this.getName() + ' <profileName> [<profileAddress>] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileName>            - The name of the profile we want to create. \n'
            + '    <profileAddress>         - [optional] the particl address of this profile. \n'
            + '                                This is the address that\'s used in the particl \n'
            + '                                messaging system. Will be automatically generated \n'
            + '                                if omitted. ';
    }
    description() {
        return 'Create a new profile.';
    }
    example() {
        return 'profile ' + this.getName() + ' myProfile PkE5U1Erz9bANXAxvHeiw6t14vDTP9EdNM ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileAddCommand.prototype, "execute", null);
ProfileAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__metadata("design:paramtypes", [Object, ProfileService_1.ProfileService])
], ProfileAddCommand);
exports.ProfileAddCommand = ProfileAddCommand;
//# sourceMappingURL=ProfileAddCommand.js.map