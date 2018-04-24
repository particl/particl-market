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
let ItemCategoryGetCommand = class ItemCategoryGetCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemCategoryService) {
        super(CommandEnumType_1.Commands.CATEGORY_GET);
        this.Logger = Logger;
        this.itemCategoryService = itemCategoryService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: id or key
     *
     * when data.params[0] is number then findById, else findOneByKey
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (typeof data.params[0] === 'number') {
                return yield this.itemCategoryService.findOne(data.params[0]);
            }
            else {
                return yield this.itemCategoryService.findOneByKey(data.params[0]);
            }
        });
    }
    usage() {
        return this.getName() + ' (<categoryId>|<categoryKey>) ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID belonging to the category we \n'
            + '                                     want to retrive. \n'
            + '    <categoryKey>                 - String - The key that identifies the category \n'
            + '                                     we want to retrieve. ';
    }
    description() {
        return 'Command for getting an item category associated with category Id or key';
    }
    example() {
        return 'category ' + this.getName() + ' 6 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemCategoryGetCommand.prototype, "execute", null);
ItemCategoryGetCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemCategoryService_1.ItemCategoryService])
], ItemCategoryGetCommand);
exports.ItemCategoryGetCommand = ItemCategoryGetCommand;
//# sourceMappingURL=ItemCategoryGetCommand.js.map