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
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const MessageException_1 = require("../../exceptions/MessageException");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const SearchOrder_1 = require("../../enums/SearchOrder");
let ItemCategoryRemoveCommand = class ItemCategoryRemoveCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemCategoryService, listingItemService, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.CATEGORY_REMOVE);
        this.Logger = Logger;
        this.itemCategoryService = itemCategoryService;
        this.listingItemService = listingItemService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * remove user defined category
     * data.params[]:
     *  [0]: category id
     *
     * @param data
     * @returns {Promise<void>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!data.params[0]) {
                throw new MessageException_1.MessageException('Missing categoryId.');
            }
            const categoryId = data.params[0];
            yield this.itemCategoryService.findOne(categoryId)
                .then(value => {
                const itemCategory = value.toJSON();
                if (itemCategory.key) {
                    throw new MessageException_1.MessageException('Default Category cant be removed.');
                }
            })
                .catch(reason => {
                throw new MessageException_1.MessageException('Invalid categoryId.');
            });
            // check listingItemTemplate related with category
            yield this.listingItemTemplateService.search({
                page: 0,
                pageLimit: 10,
                order: SearchOrder_1.SearchOrder.ASC,
                category: categoryId
            })
                .then(values => {
                const listingItemTemplates = values.toJSON();
                if (listingItemTemplates.length > 0) {
                    throw new MessageException_1.MessageException(`Category associated with ListingItemTemplate can't be deleted. id= ${categoryId}`);
                }
            });
            // check listingItem related with category
            yield this.listingItemService.search({
                page: 0,
                pageLimit: 10,
                order: SearchOrder_1.SearchOrder.ASC,
                category: categoryId
            })
                .then(values => {
                this.log.debug('values:', JSON.stringify(values, null, 2));
                const listingItems = values.toJSON();
                if (listingItems.length > 0) {
                    throw new MessageException_1.MessageException(`Category associated with ListingItem can't be deleted. id= ${categoryId}`);
                }
            });
            return yield this.itemCategoryService.destroy(categoryId);
        });
    }
    usage() {
        return this.getName() + ' <categoryId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID belonging to the category we \n'
            + '                                     want to destroy. ';
    }
    description() {
        return 'Remove and destroy an item category via categoryId.';
    }
    example() {
        return 'category ' + this.getName() + ' 81 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemCategoryRemoveCommand.prototype, "execute", null);
ItemCategoryRemoveCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemCategoryService_1.ItemCategoryService,
        ListingItemService_1.ListingItemService,
        ListingItemTemplateService_1.ListingItemTemplateService])
], ItemCategoryRemoveCommand);
exports.ItemCategoryRemoveCommand = ItemCategoryRemoveCommand;
//# sourceMappingURL=ItemCategoryRemoveCommand.js.map