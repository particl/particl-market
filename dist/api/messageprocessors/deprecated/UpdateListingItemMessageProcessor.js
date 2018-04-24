"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const _ = require("lodash");
const constants_1 = require("../../../constants");
const ListingItemFactory_1 = require("../../factories/ListingItemFactory");
const ListingItemService_1 = require("../../services/ListingItemService");
const ItemCategoryFactory_1 = require("../../factories/ItemCategoryFactory");
const MessagingInformationFactory_1 = require("../../factories/MessagingInformationFactory");
const ItemCategoryService_1 = require("../../services/ItemCategoryService");
const MarketService_1 = require("../../services/MarketService");
const events_1 = require("../../../core/api/events");
let UpdateListingItemMessageProcessor = class UpdateListingItemMessageProcessor {
    constructor(listingItemFactory, itemCategoryFactory, mesInfoFactory, listingItemService, itemCategoryService, marketService, eventEmitter, Logger) {
        this.listingItemFactory = listingItemFactory;
        this.itemCategoryFactory = itemCategoryFactory;
        this.mesInfoFactory = mesInfoFactory;
        this.listingItemService = listingItemService;
        this.itemCategoryService = itemCategoryService;
        this.marketService = marketService;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    process(listingItemMessage, marketAddress) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /*
                    // get market
                    const marketModel = await this.marketService.findByAddress(marketAddress);
                    const market = marketModel.toJSON();
            
                    // create the new custom categories in case there are some
                    const itemCategory: resources.ItemCategory = await this.createCategoriesFromArray(listingItemMessage.information.category);
            
                    // find the categories/get the root category with related
                    const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
                    const rootCategory = rootCategoryWithRelatedModel.toJSON();
            
                    // get ListingItem
                    const listingItemToUpdate = await this.listingItemService.findOneByHash(listingItemMessage.hash);
            
                    // create ListingItem
                    const listingItemUpdateRequest = await this.listingItemFactory.getModel(listingItemMessage, market.id, rootCategory);
                    // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));
            
                    const listingItem = await this.listingItemService.update(listingItemToUpdate.Id, listingItemUpdateRequest as ListingItemUpdateRequest);
            
                    this.eventEmitter.emit('cli', {
                        message: 'update listing item message received ' + JSON.stringify(listingItem)
                    });
                    return listingItem.toJSON();
            */
            return {};
        });
    }
    /**
     * TODO: move to service
     * create categories from array and will return last category <ItemCategory> Model
     *
     * @param categoryArray : string[]
     * @returns {Promise<ItemCategory>}
     */
    getOrCreateCategories(categoryArray) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const rootCategoryWithRelatedModel = yield this.itemCategoryService.findRoot();
            let rootCategoryToSearchFrom = rootCategoryWithRelatedModel.toJSON();
            for (const categoryKeyOrName of categoryArray) {
                let existingCategory = yield this.findCategory(rootCategoryToSearchFrom, categoryKeyOrName);
                if (!existingCategory) {
                    // category did not exist, so we need to create it
                    const categoryCreateRequest = {
                        name: categoryKeyOrName,
                        parent_item_category_id: rootCategoryToSearchFrom.id
                    };
                    // create and assign it as existingCategoru
                    const newCategory = yield this.itemCategoryService.create(categoryCreateRequest);
                    existingCategory = newCategory.toJSON();
                }
                else {
                    // category exists, fetch it
                    const existingCategoryModel = yield this.itemCategoryService.findOneByKey(categoryKeyOrName);
                    existingCategory = existingCategoryModel.toJSON();
                }
                rootCategoryToSearchFrom = existingCategory;
            }
            // return the last catego
            return rootCategoryToSearchFrom;
        });
    }
    /**
     * TODO: move to service
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    findCategory(rootCategory, keyOrName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (rootCategory.key === keyOrName) {
                // root case
                return rootCategory;
            }
            else {
                // search the children for a match
                const childCategories = rootCategory.ChildItemCategories;
                return _.find(childCategories, (childCategory) => {
                    return (childCategory['key'] === keyOrName || childCategory['name'] === keyOrName);
                });
            }
        });
    }
};
UpdateListingItemMessageProcessor = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Factory.ListingItemFactory)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Factory.ItemCategoryFactory)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Factory.MessagingInformationFactory)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(6, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(7, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ListingItemFactory_1.ListingItemFactory,
        ItemCategoryFactory_1.ItemCategoryFactory,
        MessagingInformationFactory_1.MessagingInformationFactory,
        ListingItemService_1.ListingItemService,
        ItemCategoryService_1.ItemCategoryService,
        MarketService_1.MarketService,
        events_1.EventEmitter, Object])
], UpdateListingItemMessageProcessor);
exports.UpdateListingItemMessageProcessor = UpdateListingItemMessageProcessor;
//# sourceMappingURL=UpdateListingItemMessageProcessor.js.map