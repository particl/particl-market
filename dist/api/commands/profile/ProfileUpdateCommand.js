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
let ProfileUpdateCommand = class ProfileUpdateCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, profileService) {
        super(CommandEnumType_1.Commands.PROFILE_UPDATE);
        this.Logger = Logger;
        this.profileService = profileService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: profile id to be updated
     *  [1]: new profile name
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.profileService.update(data.params[0], {
                name: data.params[1]
            });
        });
    }
    usage() {
        return this.getName() + ' <profileId> <newProfileName> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - Numeric - The ID of the profile we want to modify. \n'
            + '    <newProfileName>         - String - The new name we want to apply to the profile. ';
    }
    description() {
        return 'Update the details of a profile given by profileId.';
    }
    example() {
        return 'profile ' + this.getName() + ' 2 myNewProfile ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileUpdateCommand.prototype, "execute", null);
ProfileUpdateCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__metadata("design:paramtypes", [Object, ProfileService_1.ProfileService])
], ProfileUpdateCommand);
exports.ProfileUpdateCommand = ProfileUpdateCommand;
//# sourceMappingURL=ProfileUpdateCommand.js.map