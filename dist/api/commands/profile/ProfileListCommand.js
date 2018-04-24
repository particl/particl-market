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
/*
 * Get a list of all profile
 */
let ProfileListCommand = class ProfileListCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, profileService) {
        super(CommandEnumType_1.Commands.PROFILE_LIST);
        this.Logger = Logger;
        this.profileService = profileService;
        this.log = new Logger(__filename);
    }
    /**
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Profile>>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.profileService.findAll();
        });
    }
    usage() {
        return this.getName() + ' ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n';
    }
    description() {
        return 'List all the profiles.';
    }
    example() {
        return 'profile ' + this.getName() + ' ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileListCommand.prototype, "execute", null);
ProfileListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__metadata("design:paramtypes", [Object, ProfileService_1.ProfileService])
], ProfileListCommand);
exports.ProfileListCommand = ProfileListCommand;
//# sourceMappingURL=ProfileListCommand.js.map