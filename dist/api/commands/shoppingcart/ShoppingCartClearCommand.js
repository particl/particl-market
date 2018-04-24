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
let ShoppingCartClearCommand = class ShoppingCartClearCommand extends BaseCommand_1.BaseCommand {
    constructor(shoppingCartItemService, Logger) {
        super(CommandEnumType_1.Commands.SHOPPINGCART_CLEAR);
        this.shoppingCartItemService = shoppingCartItemService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: cartId
     *
     * @param data
     * @returns {Promise<any>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.shoppingCartItemService.clearCart(data.params[0]);
        });
    }
    usage() {
        return this.getName() + ' <cartId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - The Id of the shopping cart we want to clear. ';
    }
    description() {
        return 'Clear shopping cart items, associated with given shopping cart id.';
    }
    example() {
        return 'cart ' + this.getName() + ' 1 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShoppingCartClearCommand.prototype, "execute", null);
ShoppingCartClearCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ShoppingCartItemService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ShoppingCartItemService_1.ShoppingCartItemService, Object])
], ShoppingCartClearCommand);
exports.ShoppingCartClearCommand = ShoppingCartClearCommand;
//# sourceMappingURL=ShoppingCartClearCommand.js.map