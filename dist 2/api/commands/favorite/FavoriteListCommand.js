"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const RpcRequest_1 = require("../../requests/RpcRequest");
const MessageException_1 = require("../../exceptions/MessageException");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const ProfileService_1 = require("../../services/ProfileService");
const FavoriteItemService_1 = require("../../services/FavoriteItemService");
/*
 * Get a list of all favorites for profile
 */
let FavoriteListCommand = class FavoriteListCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, profileService, favoriteItemService) {
        super(CommandEnumType_1.Commands.FAVORITE_LIST);
        this.Logger = Logger;
        this.profileService = profileService;
        this.favoriteItemService = favoriteItemService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: withRelated, boolean
     *
     * @param {RpcRequest} data
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.profileService.findOne(data.params[0])
                .then((value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const profile = value.toJSON();
                return yield this.favoriteItemService.findAllByProfileId(profile.id, data.params[1]);
            }));
        });
    }
    /**
     * data.params[]:
     *  [0]: profileId or profileName
     *  [1]: withRelated, boolean
     *
     * if data.params[0] is number then find favorites by profileId else find by profile Name
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 1) {
                throw new MessageException_1.MessageException('Missing profileId or profileName.');
            }
            if (typeof data.params[0] === 'string') {
                const profileModel = yield this.profileService.findOneByName(data.params[0]);
                const profile = profileModel.toJSON();
                data.params[0] = profile.id;
            }
            return data;
        });
    }
    usage() {
        return this.getName() + ' [<profileId>|<profileName>] [<withRelated>]';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>                   - [optional]- Numeric - The ID of the profile we \n'
            + '                                     want to retrive favorites associated with that profile id. \n'
            + '    <profileName>                 - [optional] - String - The name of the profile we \n'
            + '                                     want to retrive favorites associated with that profile name. \n'
            + '    <withRelated>                 - [optional] Boolean - Whether we want to include all sub objects. ';
    }
    description() {
        return 'List the favorites associated with a profileId or profileName.';
    }
    example() {
        return 'favorite ' + this.getName() + ' 1 true';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], FavoriteListCommand.prototype, "execute", null);
FavoriteListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.FavoriteItemService)),
    tslib_1.__metadata("design:paramtypes", [Object, ProfileService_1.ProfileService,
        FavoriteItemService_1.FavoriteItemService])
], FavoriteListCommand);
exports.FavoriteListCommand = FavoriteListCommand;
//# sourceMappingURL=FavoriteListCommand.js.map