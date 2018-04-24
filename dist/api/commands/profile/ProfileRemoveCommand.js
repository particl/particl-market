"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const RpcRequest_1 = require("../../requests/RpcRequest");
const ProfileService_1 = require("../../services/ProfileService");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ProfileRemoveCommand = class ProfileRemoveCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, profileService) {
        super(CommandEnumType_1.Commands.PROFILE_REMOVE);
        this.Logger = Logger;
        this.profileService = profileService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: id or name
     *
     * @param data
     * @returns {Promise<void>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let profileId = data.params[0];
            // if params is string then find profile by name to delete
            if (typeof data.params[0] === 'string') {
                const profile = yield this.profileService.findOneByName(data.params[0]);
                profileId = profile ? profile.id : data.params[0];
            }
            return this.profileService.destroy(profileId);
        });
    }
    usage() {
        return this.getName() + ' (<profileId>|<profileName>) ';
    }
    help() {
        return this.usage() + '- ' + this.description() + ' \n'
            + '    <profileID>              -  That profile ID of the profile we want to destroy. \n'
            + '    <profileName>            -  String - The name of the profile we \n'
            + '                                 want to destroy. ';
    }
    description() {
        return 'Destroy a profile by profile id or profileName.';
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
], ProfileRemoveCommand.prototype, "execute", null);
ProfileRemoveCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__metadata("design:paramtypes", [Object, ProfileService_1.ProfileService])
], ProfileRemoveCommand);
exports.ProfileRemoveCommand = ProfileRemoveCommand;
//# sourceMappingURL=ProfileRemoveCommand.js.map