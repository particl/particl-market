"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ItemImageService_1 = require("../../services/ItemImageService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const MessageException_1 = require("../../exceptions/MessageException");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ItemImageRemoveCommand = class ItemImageRemoveCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemImageService) {
        super(CommandEnumType_1.Commands.ITEMIMAGE_REMOVE);
        this.Logger = Logger;
        this.itemImageService = itemImageService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: ItemImage.Id
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find itemImage
            const itemImage = yield this.itemImageService.findOne(data.params[0]);
            // find related itemInformation
            const itemInformation = itemImage.related('ItemInformation').toJSON();
            // check if item already been posted
            if (itemInformation.listingItemId) {
                throw new MessageException_1.MessageException(`Can't delete itemImage because the item has allready been posted!`);
            }
            return this.itemImageService.destroy(data.params[0]);
        });
    }
    usage() {
        return this.getName() + ' <itemImageId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <itemImageId>                 - Numeric - The ID of the image we want to remove.';
    }
    description() {
        return 'Remove an item\'s image, identified by its ID.';
    }
    example() {
        return 'image ' + this.getName() + ' 1 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageRemoveCommand.prototype, "execute", null);
ItemImageRemoveCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemImageService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemImageService_1.ItemImageService])
], ItemImageRemoveCommand);
exports.ItemImageRemoveCommand = ItemImageRemoveCommand;
//# sourceMappingURL=ItemImageRemoveCommand.js.map