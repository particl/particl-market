"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const RpcRequest_1 = require("../../requests/RpcRequest");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const BaseCommand_1 = require("../BaseCommand");
const CommandEnumType_1 = require("../CommandEnumType");
const ShoppingCartItemService_1 = require("../../services/ShoppingCartItemService");
const ListingItemService_1 = require("../../services/ListingItemService");
const MessageException_1 = require("../../exceptions/MessageException");
let ShoppingCartItemAddCommand = class ShoppingCartItemAddCommand extends BaseCommand_1.BaseCommand {
    constructor(shoppingCartItemService, listingItemService, Logger) {
        super(CommandEnumType_1.Commands.SHOPPINGCARTITEM_ADD);
        this.shoppingCartItemService = shoppingCartItemService;
        this.listingItemService = listingItemService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: cartId
     *  [1]: itemId | hash
     *
     * @param data
     * @returns {Promise<ShoppingCartItem>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params[0] && data.params[1]) {
                // check if listingItem hash then get Id and pass as parameter
                let listingItemId = data.params[1];
                if (typeof data.params[1] !== 'number') {
                    const listingItem = yield this.listingItemService.findOneByHash(listingItemId);
                    listingItemId = listingItem.id;
                }
                return this.shoppingCartItemService.create({
                    shopping_cart_id: data.params[0],
                    listing_item_id: listingItemId
                });
            }
            else {
                throw new MessageException_1.MessageException('cartId and listingItemId can\'t be blank');
            }
        });
    }
    usage() {
        return this.getName() + ' <cartId> (<itemId>|<hash>) ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - The Id of the shopping cart we want to use. \n'
            + '    <itemId>                 - Id of the ListingItem we want to add to the cart. \n'
            + '    <hash>                   - Hash of the ListingItem we want to add to the cart. ';
    }
    description() {
        return 'Add a new item into shopping cart as per given listingItem and cart.';
    }
    example() {
        return 'cartitem ' + this.getName() + ' 1 1 b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShoppingCartItemAddCommand.prototype, "execute", null);
ShoppingCartItemAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ShoppingCartItemService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ShoppingCartItemService_1.ShoppingCartItemService,
        ListingItemService_1.ListingItemService, Object])
], ShoppingCartItemAddCommand);
exports.ShoppingCartItemAddCommand = ShoppingCartItemAddCommand;
//# sourceMappingURL=ShoppingCartItemAddCommand.js.map