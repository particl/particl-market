"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemService_1 = require("../../services/ListingItemService");
const FlaggedItemService_1 = require("../../services/FlaggedItemService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
let ListingItemFlagCommand = class ListingItemFlagCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService, flaggedItemService) {
        super(CommandEnumType_1.Commands.ITEM_FLAG);
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.flaggedItemService = flaggedItemService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: listingItemId or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<FlaggedItem>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let listingItem;
            // if listingItemId is number then findById, else findOneByHash
            if (typeof data.params[0] === 'number') {
                listingItem = yield this.listingItemService.findOne(data.params[0]);
            }
            else {
                listingItem = yield this.listingItemService.findOneByHash(data.params[0]);
            }
            // check if item already flagged
            const isFlagged = yield this.listingItemService.isItemFlagged(listingItem);
            if (isFlagged) {
                throw new MessageException_1.MessageException('Item already beeing flagged!');
            }
            else {
                // create FlaggedItem
                return yield this.flaggedItemService.create({
                    listingItemId: listingItem.id
                });
            }
        });
    }
    usage() {
        return this.getName() + ' [<listingItemId>|<hash>] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemId>     - [optional] Numeric - The ID of the listing item we want to flag. \n'
            + '    <hash>             - [optional] String - The hash of the listing item we want to flag. \n';
    }
    description() {
        return 'Flag a listing item via given listingItemId or hash.';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemFlagCommand.prototype, "execute", null);
ListingItemFlagCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.FlaggedItemService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService,
        FlaggedItemService_1.FlaggedItemService])
], ListingItemFlagCommand);
exports.ListingItemFlagCommand = ListingItemFlagCommand;
//# sourceMappingURL=ListingItemFlagCommand.js.map