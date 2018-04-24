"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const FavoriteItemService_1 = require("../../services/FavoriteItemService");
const ListingItemService_1 = require("../../services/ListingItemService");
const ProfileService_1 = require("../../services/ProfileService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const NotFoundException_1 = require("../../exceptions/NotFoundException");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
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
     *  [0]: profile_id or null
     *  [1]: item_id or hash
     *
     * when data.params[0] is null then use default profile
     * when data.params[1] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<FavoriteItem>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const favoriteParams = yield this.getSearchParams(data);
            // Check if favorite Item already exist
            let favoriteItem = yield this.favoriteItemService.search({ profileId: favoriteParams[0], itemId: favoriteParams[1] });
            // favorite item not already exist then create
            if (favoriteItem === null) {
                favoriteItem = yield this.favoriteItemService.create({
                    profile_id: favoriteParams[0],
                    listing_item_id: favoriteParams[1]
                });
            }
            return favoriteItem;
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
    /**
     * TODO: NOTE: This function may be duplicated between commands.
     * data.params[]:
     *  [0]: item_id or hash
     *  [1]: profile_id or null
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     */
    getSearchParams(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let profileId = data.params[0];
            let itemId = data.params[1] || 0;
            // if item hash is in the params
            if (itemId && typeof itemId === 'string') {
                const listingItem = yield this.listingItemService.findOneByHash(data.params[1]);
                itemId = listingItem.id;
            }
            // find listing item by id
            const item = yield this.listingItemService.findOne(itemId);
            // if profile id not found in the params then find default profile
            if (!profileId || typeof profileId !== 'number') {
                const profile = yield this.profileService.findOneByName('DEFAULT');
                profileId = profile.id;
            }
            if (item === null) {
                this.log.warn(`ListingItem with the id=${itemId} was not found!`);
                throw new NotFoundException_1.NotFoundException(itemId);
            }
            return [profileId, item.id];
        });
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