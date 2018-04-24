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
const MessageException_1 = require("../../exceptions/MessageException");
let ItemCategoryAddCommand = class ItemCategoryAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemCategoryService) {
        super(CommandEnumType_1.Commands.CATEGORY_ADD);
        this.Logger = Logger;
        this.itemCategoryService = itemCategoryService;
        this.log = new Logger(__filename);
    }
    /**
     * creates a new user defined category, these don't have a key and they always need to have a parent_item_category_id
     *
     * data.params[]:
     *  [0]: category name
     *  [1]: description
     *  [2]: parent_item_category_id id/key
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params[2]) {
                const parentItemCategory = data.params[2];
                const parentItemCategoryId = yield this.getCategoryIdByKey(parentItemCategory);
                return yield this.itemCategoryService.create({
                    name: data.params[0],
                    description: data.params[1],
                    parent_item_category_id: parentItemCategoryId
                });
            }
            else {
                throw new MessageException_1.MessageException(`Parent category can't be null or undefined!`);
            }
        });
    }
    usage() {
        return this.getName() + ' <categoryName> <description> (<parentItemCategoryId>|<parentItemCategoryKey>) ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryName>                - String - The name of the category to create. \n'
            + '    <description>                 - String - A description of the category to \n'
            + '                                     create. \n'
            + '    <parentItemCategoryId>        - Numeric - The ID of the parent category of the \n'
            + '                                     category we\'re creating. \n'
            + '    <parentItemCategoryKey>       - String - The identifying key of the parent \n'
            + '                                     category of the category we\'re creating. ';
    }
    description() {
        return 'Command for adding an item category.';
    }
    example() {
        return 'category ' + this.getName() + ' newCategory \'description of the new category\' cat_wholesale_other ';
    }
    /**
     * function to return category id
     * TODO: NOTE: This function may be duplicated between commands.
     *
     * @param data
     * @returns {Promise<number>}
     */
    getCategoryIdByKey(parentItemCategory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let parentItemCategoryId;
            if (typeof parentItemCategory === 'number') {
                parentItemCategoryId = parentItemCategory;
            }
            else {
                parentItemCategory = yield this.itemCategoryService.findOneByKey(parentItemCategory);
                parentItemCategoryId = parentItemCategory.id;
            }
            return parentItemCategoryId;
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemCategoryAddCommand.prototype, "execute", null);
ItemCategoryAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemCategoryService_1.ItemCategoryService])
], ItemCategoryAddCommand);
exports.ItemCategoryAddCommand = ItemCategoryAddCommand;
//# sourceMappingURL=ItemCategoryAddCommand.js.map