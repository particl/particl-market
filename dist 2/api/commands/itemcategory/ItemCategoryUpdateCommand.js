"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ItemCategoryService_1 = require("../../services/ItemCategoryService");
const ListingItemService_1 = require("../../services/ListingItemService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const MessageException_1 = require("../../exceptions/MessageException");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ItemCategoryUpdateCommand = class ItemCategoryUpdateCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemCategoryService, listingItemService) {
        super(CommandEnumType_1.Commands.CATEGORY_UPDATE);
        this.Logger = Logger;
        this.itemCategoryService = itemCategoryService;
        this.listingItemService = listingItemService;
        this.log = new Logger(__filename);
    }
    /**
     * updates user defined category
     *
     * data.params[]:
     *  [0]: category id
     *  [1]: category name
     *  [2]: description
     *  [3]: parentItemCategoryId
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const categoryId = data.params[0];
            const name = data.params[1];
            const description = data.params[2];
            const parentItemCategoryId = data.params[3] || 'cat_ROOT';
            return yield this.itemCategoryService.update(categoryId, {
                name,
                description,
                parent_item_category_id: parentItemCategoryId
            });
        });
    }
    /**
     * - should have 4 params
     * - if category has key, it cant be edited
     * - ...
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 4) {
                throw new MessageException_1.MessageException('Missing parameters.');
            }
            const categoryId = data.params[0];
            const itemCategoryModel = yield this.itemCategoryService.findOne(categoryId);
            const itemCategory = itemCategoryModel.toJSON();
            // if category has a key, its a default category and cant be updated
            if (itemCategory.key != null) {
                throw new MessageException_1.MessageException(`Default category can't be updated or deleted.`);
            }
            return data;
        });
    }
    usage() {
        return this.getName() + ' <categoryId> <categoryName> <description> [<parentItemCategoryId>] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID of the category we want to \n'
            + '                                     update. \n'
            + '    <categoryName>                - String - The new name of the category we want \n'
            + '                                     to update. \n'
            + '    <description>                 - String - The new description of the category \n'
            + '                                     we want to update. \n'
            + '    <parentItemCategoryId>        - [optional] Numeric - The ID that identifies the \n'
            + '                                     new parent category of the category we want to \n'
            + '                                     update; default is the root category. ';
    }
    description() {
        return 'Update the details of an item category given by categoryId.';
    }
    example() {
        return 'category ' + this.getName() + ' 81 updatedCategory \'Updated category description\' 80 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemCategoryUpdateCommand.prototype, "execute", null);
ItemCategoryUpdateCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemCategoryService_1.ItemCategoryService,
        ListingItemService_1.ListingItemService])
], ItemCategoryUpdateCommand);
exports.ItemCategoryUpdateCommand = ItemCategoryUpdateCommand;
//# sourceMappingURL=ItemCategoryUpdateCommand.js.map