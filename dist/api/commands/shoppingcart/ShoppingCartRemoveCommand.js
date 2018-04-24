"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const RpcRequest_1 = require("../../requests/RpcRequest");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const BaseCommand_1 = require("../BaseCommand");
const CommandEnumType_1 = require("../CommandEnumType");
const ShoppingCartService_1 = require("../../services/ShoppingCartService");
let ShoppingCartRemoveCommand = class ShoppingCartRemoveCommand extends BaseCommand_1.BaseCommand {
    constructor(shoppingCartService, Logger) {
        super(CommandEnumType_1.Commands.SHOPPINGCART_REMOVE);
        this.shoppingCartService = shoppingCartService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: cartId
     *
     * @param data
     * @returns {Promise<void>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.shoppingCartService.destroy(data.params[0]);
        });
    }
    usage() {
        return this.getName() + ' <cartId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - The Id of the shopping cart we want to remove. ';
    }
    description() {
        return 'Destroy a shopping cart associated with given cartId.';
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
], ShoppingCartRemoveCommand.prototype, "execute", null);
ShoppingCartRemoveCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ShoppingCartService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ShoppingCartService_1.ShoppingCartService, Object])
], ShoppingCartRemoveCommand);
exports.ShoppingCartRemoveCommand = ShoppingCartRemoveCommand;
//# sourceMappingURL=ShoppingCartRemoveCommand.js.map