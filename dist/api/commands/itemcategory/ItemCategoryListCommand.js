"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ItemCategoryService_1 = require("../../services/ItemCategoryService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ItemCategoryListCommand = class ItemCategoryListCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemCategoryService) {
        super(CommandEnumType_1.Commands.CATEGORY_LIST);
        this.Logger = Logger;
        this.itemCategoryService = itemCategoryService;
        this.log = new Logger(__filename);
    }
    /**
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.itemCategoryService.findRoot();
        });
    }
    usage() {
        return this.getName() + ' ';
    }
    help() {
        return this.usage() + '  -  ' + this.description() + ' \n';
    }
    description() {
        return 'List all the item categories.';
    }
    example() {
        return 'category ' + this.getName() + ' ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemCategoryListCommand.prototype, "execute", null);
ItemCategoryListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemCategoryService_1.ItemCategoryService])
], ItemCategoryListCommand);
exports.ItemCategoryListCommand = ItemCategoryListCommand;
//# sourceMappingURL=ItemCategoryListCommand.js.map