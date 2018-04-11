import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { ListingItemRepository } from '../repositories/ListingItemRepository';
import { ListingItem } from '../models/ListingItem';

import { MessagingInformationService } from './MessagingInformationService';
import { PaymentInformationService } from './PaymentInformationService';
import { ItemInformationService } from './ItemInformationService';
import { ItemCategoryService } from './ItemCategoryService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { MarketService } from './MarketService';

import { ListingItemTemplatePostRequest } from '../requests/ListingItemTemplatePostRequest';
import { ListingItemUpdatePostRequest } from '../requests/ListingItemUpdatePostRequest';

import { ListingItemTemplateService } from './ListingItemTemplateService';
import { ListingItemFactory } from '../factories/ListingItemFactory';
import { SmsgService } from './SmsgService';
import { Market } from '../models/Market';
import { ListingItemObjectService } from './ListingItemObjectService';
import { FlaggedItemService } from './FlaggedItemService';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import * as resources from 'resources';
import { EventEmitter } from 'events';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { MessageException } from '../exceptions/MessageException';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { ListingItemService } from './ListingItemService';
import { ActionMessageService } from './ActionMessageService';

export class ListingItemActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.CryptocurrencyAddressService) public cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) public messagingInformationService: MessagingInformationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemObjectService) public listingItemObjectService: ListingItemObjectService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) public actionMessageService: ActionMessageService,
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) private listingItemFactory: ListingItemFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * post a ListingItem based on a given ListingItem as ListingItemMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async post( @request(ListingItemTemplatePostRequest) data: ListingItemTemplatePostRequest): Promise<SmsgSendResponse> {

        // fetch the listingItemTemplate
        const itemTemplateModel = await this.listingItemTemplateService.findOne(data.listingItemTemplateId);
        const itemTemplate = itemTemplateModel.toJSON();

        // this.log.debug('post template: ', JSON.stringify(itemTemplate, null, 2));
        // get the templates profile address
        const profileAddress = itemTemplate.Profile.address;

        // fetch the market, will be used later with the broadcast
        const marketModel: Market = await _.isEmpty(data.marketId)
            ? await this.marketService.getDefault()
            : await this.marketService.findOne(data.marketId);
        const market = marketModel.toJSON();

        // find itemCategory with related
        const itemCategoryModel = await this.itemCategoryService.findOneByKey(itemTemplate.ItemInformation.ItemCategory.key, true);
        const itemCategory = itemCategoryModel.toJSON();
        // this.log.debug('itemCategory: ', JSON.stringify(itemCategory, null, 2));

        const listingItemMessage = await this.listingItemFactory.getMessage(itemTemplate);

        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            item: listingItemMessage
        } as MarketplaceMessage;

        this.log.debug('post(), marketPlaceMessage: ', marketPlaceMessage);
        return await this.smsgService.smsgSend(profileAddress, market.address, marketPlaceMessage);
    }

    /**
     * update a ListingItem based on a given ListingItem as ListingItemUpdateMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async updatePostItem( @request(ListingItemUpdatePostRequest) data: ListingItemUpdatePostRequest): Promise<void> {

        // TODO: update not implemented/supported yet

        throw new NotImplementedException();
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
    }

    /**
     * processes received ListingItemMessage
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<"resources".ListingItem>}
     */
    public async processListingItemReceivedEvent(event: MarketplaceEvent): Promise<resources.ListingItem> {
        // todo: this returns ListingItem and processed BidMessages return ActionMessage's

        this.log.info('Received event:', event);

        const message = event.marketplaceMessage;

        if (message.market && message.item) {
            // get market
            const marketModel = await this.marketService.findByAddress(message.market);
            const market = marketModel.toJSON();

            const listingItemMessage = message.item;
            // create the new custom categories in case there are some
            const itemCategory: resources.ItemCategory = await this.itemCategoryService.createCategoriesFromArray(listingItemMessage.information.category);

            // find the categories/get the root category with related
            const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
            const rootCategory = rootCategoryWithRelatedModel.toJSON();

            // create ListingItem
            const seller = event.smsgMessage.from;
            const listingItemCreateRequest = await this.listingItemFactory.getModel(listingItemMessage, market.id, seller, rootCategory);
            // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));

            let listingItemModel = await this.listingItemService.create(listingItemCreateRequest);
            let listingItem = listingItemModel.toJSON();

            // first save it
            const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
            const actionMessage = actionMessageModel.toJSON();
            this.log.debug('created actionMessage:', JSON.stringify(actionMessage, null, 2));

            // emit the latest message event to cli
            // this.eventEmitter.emit('cli', {
            //    message: 'new ListingItem received: ' + JSON.stringify(listingItem)
            // });

            // this.log.debug('new ListingItem received: ' + JSON.stringify(listingItem));
            listingItemModel = await this.listingItemService.findOne(listingItem.id);
            listingItem = listingItemModel.toJSON();

            this.log.debug('listingItem with actionMessage:', JSON.stringify(listingItem, null, 2));

            return listingItem;

        } else {
            throw new MessageException('Marketplace message missing market.');
        }
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.ListingItemReceivedEvent, async (event) => {
            await this.processListingItemReceivedEvent(event);
        });

    }

}
