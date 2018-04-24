"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const MessagingInformationService_1 = require("./MessagingInformationService");
const PaymentInformationService_1 = require("./PaymentInformationService");
const ItemInformationService_1 = require("./ItemInformationService");
const ItemCategoryService_1 = require("./ItemCategoryService");
const CryptocurrencyAddressService_1 = require("./CryptocurrencyAddressService");
const MarketService_1 = require("./MarketService");
const ListingItemTemplatePostRequest_1 = require("../requests/ListingItemTemplatePostRequest");
const ListingItemUpdatePostRequest_1 = require("../requests/ListingItemUpdatePostRequest");
const ListingItemTemplateService_1 = require("./ListingItemTemplateService");
const ListingItemFactory_1 = require("../factories/ListingItemFactory");
const SmsgService_1 = require("./SmsgService");
const ListingItemObjectService_1 = require("./ListingItemObjectService");
const FlaggedItemService_1 = require("./FlaggedItemService");
const NotImplementedException_1 = require("../exceptions/NotImplementedException");
const events_1 = require("events");
const MessageException_1 = require("../exceptions/MessageException");
const ListingItemService_1 = require("./ListingItemService");
const ActionMessageService_1 = require("./ActionMessageService");
let ListingItemActionService = class ListingItemActionService {
    constructor(marketService, cryptocurrencyAddressService, itemInformationService, itemCategoryService, paymentInformationService, messagingInformationService, listingItemTemplateService, listingItemService, listingItemObjectService, smsgService, flaggedItemService, actionMessageService, listingItemFactory, eventEmitter, Logger) {
        this.marketService = marketService;
        this.cryptocurrencyAddressService = cryptocurrencyAddressService;
        this.itemInformationService = itemInformationService;
        this.itemCategoryService = itemCategoryService;
        this.paymentInformationService = paymentInformationService;
        this.messagingInformationService = messagingInformationService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.listingItemService = listingItemService;
        this.listingItemObjectService = listingItemObjectService;
        this.smsgService = smsgService;
        this.flaggedItemService = flaggedItemService;
        this.actionMessageService = actionMessageService;
        this.listingItemFactory = listingItemFactory;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }
    /**
     * post a ListingItem based on a given ListingItem as ListingItemMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    post(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // fetch the listingItemTemplate
            const itemTemplateModel = yield this.listingItemTemplateService.findOne(data.listingItemTemplateId);
            const itemTemplate = itemTemplateModel.toJSON();
            // this.log.debug('post template: ', JSON.stringify(itemTemplate, null, 2));
            // get the templates profile address
            const profileAddress = itemTemplate.Profile.address;
            // fetch the market, will be used later with the broadcast
            const marketModel = (yield _.isEmpty(data.marketId))
                ? yield this.marketService.getDefault()
                : yield this.marketService.findOne(data.marketId);
            const market = marketModel.toJSON();
            // find itemCategory with related
            const itemCategoryModel = yield this.itemCategoryService.findOneByKey(itemTemplate.ItemInformation.ItemCategory.key, true);
            const itemCategory = itemCategoryModel.toJSON();
            // this.log.debug('itemCategory: ', JSON.stringify(itemCategory, null, 2));
            const listingItemMessage = yield this.listingItemFactory.getMessage(itemTemplate);
            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                item: listingItemMessage
            };
            this.log.debug('post(), marketPlaceMessage: ', marketPlaceMessage);
            return yield this.smsgService.smsgSend(profileAddress, market.address, marketPlaceMessage);
        });
    }
    /**
     * update a ListingItem based on a given ListingItem as ListingItemUpdateMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    updatePostItem(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: update not implemented/supported yet
            throw new NotImplementedException_1.NotImplementedException();
            /*
            // fetch the listingItemTemplate
            const itemTemplateModel = await this.findOne(data.listingItemTemplateId);
            const itemTemplate = itemTemplateModel.toJSON();
    
            // get the templates profile address
            const profileAddress = itemTemplate.Profile.address;
    
            // check listing-item
            const listingItems = itemTemplateModel.related('ListingItem').toJSON() || [];
            if (listingItems.length > 0) {
                // ListingItemMessage for update
                const rootCategoryWithRelated: any = await this.itemCategoryService.findRoot();
                const updateItemMessage = await this.listingItemFactory.getMessage(itemTemplate, rootCategoryWithRelated);
                updateItemMessage.hash = data.hash; // replace with param hash of listing-item
    
                // TODO: Need to update broadcast message return after broadcast functionality will be done.
                this.smsgService.broadcast(profileAddress, market.address, updateItemMessage as ListingItemMessage);
            } else {
                this.log.warn(`No listingItem related with listing_item_template_id=${data.hash}!`);
                throw new MessageException(`No listingItem related with listing_item_template_id=${data.hash}!`);
            }
            */
        });
    }
    /**
     * processes received ListingItemMessage
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<"resources".ListingItem>}
     */
    processListingItemReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo: this returns ListingItem and processed BidMessages return ActionMessage's
            this.log.info('Received event:', event);
            const message = event.marketplaceMessage;
            if (message.market && message.item) {
                // get market
                const marketModel = yield this.marketService.findByAddress(message.market);
                const market = marketModel.toJSON();
                const listingItemMessage = message.item;
                this.log.debug('listingItemMessage: ', listingItemMessage);
                // create the new custom categories in case there are some
                const itemCategory = yield this.itemCategoryService.createCategoriesFromArray(listingItemMessage.information.category);
                // find the categories/get the root category with related
                const rootCategoryWithRelatedModel = yield this.itemCategoryService.findRoot();
                const rootCategory = rootCategoryWithRelatedModel.toJSON();
                // create ListingItem
                const seller = event.smsgMessage.from;
                const listingItemCreateRequest = yield this.listingItemFactory.getModel(listingItemMessage, market.id, seller, rootCategory);
                // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));
                let listingItemModel = yield this.listingItemService.create(listingItemCreateRequest);
                let listingItem = listingItemModel.toJSON();
                // update the template relation
                yield this.listingItemService.updateListingItemTemplateRelation(listingItem.id);
                // first save it
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                // this.log.debug('created actionMessage:', JSON.stringify(actionMessage, null, 2));
                // emit the latest message event to cli
                // this.eventEmitter.emit('cli', {
                //    message: 'new ListingItem received: ' + JSON.stringify(listingItem)
                // });
                // this.log.debug('new ListingItem received: ' + JSON.stringify(listingItem));
                listingItemModel = yield this.listingItemService.findOne(listingItem.id);
                listingItem = listingItemModel.toJSON();
                this.log.debug('saved listingItem:', JSON.stringify(listingItem, null, 2));
                return listingItem;
            }
            else {
                throw new MessageException_1.MessageException('Marketplace message missing market.');
            }
        });
    }
    configureEventListeners() {
        this.eventEmitter.on(constants_1.Events.ListingItemReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.processListingItemReceivedEvent(event);
        }));
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemTemplatePostRequest_1.ListingItemTemplatePostRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemTemplatePostRequest_1.ListingItemTemplatePostRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemActionService.prototype, "post", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ListingItemUpdatePostRequest_1.ListingItemUpdatePostRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ListingItemUpdatePostRequest_1.ListingItemUpdatePostRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemActionService.prototype, "updatePostItem", null);
ListingItemActionService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.CryptocurrencyAddressService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ItemInformationService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.PaymentInformationService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.MessagingInformationService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Service.ListingItemObjectService)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(10, inversify_1.named(constants_1.Targets.Service.FlaggedItemService)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(11, inversify_1.named(constants_1.Targets.Service.ActionMessageService)),
    tslib_1.__param(12, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(12, inversify_1.named(constants_1.Targets.Factory.ListingItemFactory)),
    tslib_1.__param(13, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(13, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(14, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(14, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MarketService_1.MarketService,
        CryptocurrencyAddressService_1.CryptocurrencyAddressService,
        ItemInformationService_1.ItemInformationService,
        ItemCategoryService_1.ItemCategoryService,
        PaymentInformationService_1.PaymentInformationService,
        MessagingInformationService_1.MessagingInformationService,
        ListingItemTemplateService_1.ListingItemTemplateService,
        ListingItemService_1.ListingItemService,
        ListingItemObjectService_1.ListingItemObjectService,
        SmsgService_1.SmsgService,
        FlaggedItemService_1.FlaggedItemService,
        ActionMessageService_1.ActionMessageService,
        ListingItemFactory_1.ListingItemFactory,
        events_1.EventEmitter, Object])
], ListingItemActionService);
exports.ListingItemActionService = ListingItemActionService;
//# sourceMappingURL=ListingItemActionService.js.map