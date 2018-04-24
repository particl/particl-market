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
let ProfileGetCommand = class ProfileGetCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, profileService) {
        super(CommandEnumType_1.Commands.PROFILE_GET);
        this.Logger = Logger;
        this.profileService = profileService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: id or name
     *
     * when data.params[0] is number then findById, else findByName
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length === 0) {
                data.params[0] = 'DEFAULT';
            }
            if (typeof data.params[0] === 'number') {
                return yield this.profileService.findOne(data.params[0]);
            }
            else {
                return yield this.profileService.findOneByName(data.params[0]);
            }
        });
    }
    usage() {
        return this.getName() + ' [<profileId>|<profileName>] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - [optional] Numeric - The ID of the profile we want to \n'
            + '                                retrieve. \n'
            + '    <profileName>            - [optional] String - The name of the profile we want to \n'
            + '                                retrieve. ';
    }
    description() {
        return 'Get profile by profile id or profile name';
    }
    example() {
        return 'profile ' + this.getName() + ' 2 myProfile ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileGetCommand.prototype, "execute", null);
ProfileGetCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__metadata("design:paramtypes", [Object, ProfileService_1.ProfileService])
], ProfileGetCommand);
exports.ProfileGetCommand = ProfileGetCommand;
//# sourceMappingURL=ProfileGetCommand.js.map