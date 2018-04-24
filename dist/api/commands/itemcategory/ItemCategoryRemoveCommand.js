"use strict";
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
            const categoryId = data.params[0];
            const isDelete = yield this.isDoable(categoryId);
            if (isDelete) {
                // check listingItemTemplate related with category
                const listingItemTemplates = yield this.listingItemTemplateService.search({
                    page: 1, pageLimit: 10, order: 'ASC', category: categoryId, profileId: 0
                });
                if (listingItemTemplates.toJSON().length > 0) {
                    // not be delete its a associated with listingItemTemplate
                    throw new MessageException_1.MessageException(`Category associated with listing-item-template can't be delete. id= ${categoryId}`);
                }
                return yield this.itemCategoryService.destroy(categoryId);
            }
            else {
                throw new MessageException_1.MessageException(`category can't be delete. id= ${categoryId}`);
            }
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
    /**
     * function to check category is default, check category is not associated with listing-item
     *
     * @param data
     * @returns {Promise<boolean>}
     */
    isDoable(categoryId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemCategory = yield this.itemCategoryService.findOne(categoryId);
            // check category has key
            if (itemCategory.Key != null) {
                // not be update/delete its a default category
                throw new MessageException_1.MessageException(`Default category can't be update or delete. id= ${categoryId}`);
            }
            // check listingItem realted with category id
            const listingItem = yield this.listingItemService.findByCategory(categoryId);
            if (listingItem.toJSON().length > 0) {
                // not be update/delete its a related with listing-items
                throw new MessageException_1.MessageException(`Category related with listing-items can't be update or delete. id= ${categoryId}`);
            }
            return true;
        });
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