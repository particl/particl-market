"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../../constants");
const ListingItemFactory_1 = require("../../factories/ListingItemFactory");
const ListingItemService_1 = require("../../services/ListingItemService");
const ItemCategoryFactory_1 = require("../../factories/ItemCategoryFactory");
const ItemCategoryService_1 = require("../../services/ItemCategoryService");
const events_1 = require("../../../core/api/events");
let ListingItemMessageProcessor = class ListingItemMessageProcessor {
    constructor(listingItemFactory, itemCategoryFactory, listingItemService, itemCategoryService, 
        // @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        eventEmitter, Logger) {
        this.listingItemFactory = listingItemFactory;
        this.itemCategoryFactory = itemCategoryFactory;
        this.listingItemService = listingItemService;
        this.itemCategoryService = itemCategoryService;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    // @validate()
    process(/*@message(ListingItemMessage)*/ listingItemMessage, marketAddress) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /*
            DEPRECATED
    
            // get market
            const marketModel = await this.marketService.findByAddress(marketAddress);
            const market = marketModel.toJSON();
    
            // create the new custom categories in case there are some
            const itemCategory: resources.ItemCategory = await this.createCategoriesFromArray(listingItemMessage.information.category);
    
            // find the categories/get the root category with related
            const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
            const rootCategory = rootCategoryWithRelatedModel.toJSON();
    
            // create ListingItem
            const listingItemCreateRequest = await this.listingItemFactory.getModel(listingItemMessage, market.id, rootCategory);
            // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));
    
            const listingItem = await this.listingItemService.create(listingItemCreateRequest);
    
            // emit the latest message event to cli
            // this.eventEmitter.emit('cli', {
            //    message: 'new ListingItem received: ' + JSON.stringify(listingItem)
            // });
    
            // this.log.debug('new ListingItem received: ' + JSON.stringify(listingItem));
            return listingItem;
            */
            return {};
        });
    }
};
ListingItemMessageProcessor = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Factory.ListingItemFactory)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Factory.ItemCategoryFactory)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(4, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(5, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ListingItemFactory_1.ListingItemFactory,
        ItemCategoryFactory_1.ItemCategoryFactory,
        ListingItemService_1.ListingItemService,
        ItemCategoryService_1.ItemCategoryService,
        events_1.EventEmitter, Object])
], ListingItemMessageProcessor);
exports.ListingItemMessageProcessor = ListingItemMessageProcessor;
//# sourceMappingURL=ListingItemMessageProcessor.js.map