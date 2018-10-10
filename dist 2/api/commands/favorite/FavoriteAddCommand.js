"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const FavoriteItemService_1 = require("../../services/FavoriteItemService");
const ListingItemService_1 = require("../../services/ListingItemService");
const ProfileService_1 = require("../../services/ProfileService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
/**
 * Command for adding an item to your favorites, identified by ID or hash.
 */
let FavoriteAddCommand = class FavoriteAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, favoriteItemService, listingItemService, profileService) {
        super(CommandEnumType_1.Commands.FAVORITE_ADD);
        this.Logger = Logger;
        this.favoriteItemService = favoriteItemService;
        this.listingItemService = listingItemService;
        this.profileService = profileService;
        this.log = new Logger(__filename);
    }
    /**
     *
     * data.params[]:
     *  [0]: profile_id
     *  [1]: item_id or hash
     *
     * when data.params[1] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<FavoriteItem>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.favoriteItemService.create({
                profile_id: data.params[0],
                listing_item_id: data.params[1]
            });
        });
    }
    /**
     * validate that profile and item exists, replace possible hash with id
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 2) {
                throw new MessageException_1.MessageException('Missing parameters.');
            }
            const profileId = data.params[0];
            let itemId = data.params[1];
            if (profileId && typeof profileId === 'string') {
                throw new MessageException_1.MessageException('profileId cant be a string.');
            }
            else {
                // make sure profile with the id exists
                yield this.profileService.findOne(profileId); // throws if not found
            }
            // if item hash is in the params, fetch the id
            if (itemId && typeof itemId === 'string') {
                const listingItemModel = yield this.listingItemService.findOneByHash(itemId);
                const listingItem = listingItemModel.toJSON();
                itemId = listingItem.id;
            }
            else {
                // else make sure the the item with the id exists, throws if not
                const item = yield this.listingItemService.findOne(itemId);
            }
            return yield this.favoriteItemService.findOneByProfileIdAndListingItemId(profileId, itemId) // throws if not found
                .catch(reason => {
                // great, not found, so we can continue and create it
                // return RpcRequest with the correct data to be passed to execute
            })
                .then(value => {
                if (value) {
                    throw new MessageException_1.MessageException('FavoriteItem allready exists.');
                }
                else {
                    data.params[0] = profileId;
                    data.params[1] = itemId;
                    return data;
                }
            });
        });
    }
    usage() {
        return this.getName() + ' <profileId> (<itemId>|<hash>) ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>                   - Numeric - The ID of the profile we \n'
            + '                                     want to associate this favorite with. \n'
            + '    <itemId>                      - Numeric - The ID of the listing item you want to \n'
            + '                                     add to your favorites. \n'
            + '    <hash>                        - String - The hash of the listing item you want \n'
            + '                                     to add to your favorites. ';
    }
    description() {
        return 'Command for adding an item to your favorites, identified by ID or hash.';
    }
    example() {
        return 'favorite ' + this.getName() + ' 1 1 b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], FavoriteAddCommand.prototype, "execute", null);
FavoriteAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.FavoriteItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__metadata("design:paramtypes", [Object, FavoriteItemService_1.FavoriteItemService,
        ListingItemService_1.ListingItemService,
        ProfileService_1.ProfileService])
], FavoriteAddCommand);
exports.FavoriteAddCommand = FavoriteAddCommand;
//# sourceMappingURL=FavoriteAddCommand.js.map