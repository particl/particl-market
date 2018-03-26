import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ListingItemRepository } from '../repositories/ListingItemRepository';
import { ListingItem } from '../models/ListingItem';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemUpdateRequest } from '../requests/ListingItemUpdateRequest';
import { MessagingInformationService } from './MessagingInformationService';
import { PaymentInformationService } from './PaymentInformationService';
import { ItemInformationService } from './ItemInformationService';
import { ItemCategoryService } from './ItemCategoryService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { MarketService } from './MarketService';
import { ListingItemSearchParams } from '../requests/ListingItemSearchParams';

import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../requests/ItemInformationUpdateRequest';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../requests/PaymentInformationUpdateRequest';
import { MessagingInformationCreateRequest } from '../requests/MessagingInformationCreateRequest';
import { MessagingInformationUpdateRequest } from '../requests/MessagingInformationUpdateRequest';

import { ListingItemTemplatePostRequest } from '../requests/ListingItemTemplatePostRequest';
import { ListingItemUpdatePostRequest } from '../requests/ListingItemUpdatePostRequest';
import { ListingItemObjectCreateRequest } from '../requests/ListingItemObjectCreateRequest';
import { ListingItemObjectUpdateRequest } from '../requests/ListingItemObjectUpdateRequest';

import { ListingItemTemplateService } from './ListingItemTemplateService';
import { ListingItemFactory } from '../factories/ListingItemFactory';
import { SmsgService } from './SmsgService';
import { Market } from '../models/Market';
import { FlaggedItem } from '../models/FlaggedItem';
import { ListingItemObjectService } from './ListingItemObjectService';
import { FlaggedItemService } from './FlaggedItemService';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { MarketplaceMessageInterface } from '../messages/MarketplaceMessageInterface';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import * as resources from 'resources';
import { EventEmitter } from 'events';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { MessageException } from '../exceptions/MessageException';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';

export class ListingItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.CryptocurrencyAddressService) public cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) public messagingInformationService: MessagingInformationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.ListingItemObjectService) public listingItemObjectService: ListingItemObjectService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) private listingItemFactory: ListingItemFactory,
        @inject(Types.Repository) @named(Targets.Repository.ListingItemRepository) public listingItemRepo: ListingItemRepository,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItem>> {
        return await this.listingItemRepo.findAll();
    }

    public async findByCategory(categoryId: number): Promise<Bookshelf.Collection<ListingItem>> {
        this.log.debug('find by category:', categoryId);
        return await this.listingItemRepo.findByCategory(categoryId);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItem> {
        const listingItem = await this.listingItemRepo.findOne(id, withRelated);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItem;
    }

    /**
     *
     * @param hash, hash of the listing Item.
     * @returns {Promise<ListingItem>}
     */
    public async findOneByHash(hash: string): Promise<ListingItem> {
        const listingItem = await this.listingItemRepo.findOneByHash(hash);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return listingItem;
    }

    /**
     * search ListingItems using given ListingItemSearchParams
     *
     * @param options
     * @param withRelated
     * @returns {Promise<Bookshelf.Collection<ListingItem>>}
     */
    @validate()
    public async search(@request(ListingItemSearchParams) options: ListingItemSearchParams,
                        withRelated: boolean = true): Promise<Bookshelf.Collection<ListingItem>> {
        // if valid params
        // todo: check whether category is string or number, if string, try to find the Category by key
        return this.listingItemRepo.search(options, withRelated);
    }

    /**
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async create( @request(ListingItemCreateRequest) data: ListingItemCreateRequest): Promise<ListingItem> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create ListingItem, body: ', JSON.stringify(body, null, 2));

        // extract and remove related models from request
        const itemInformation = body.itemInformation;
        delete body.itemInformation;
        const paymentInformation = body.paymentInformation;
        delete body.paymentInformation;
        const messagingInformation = body.messagingInformation || [];
        delete body.messagingInformation;
        const listingItemObjects = body.listingItemObjects || [];
        delete body.listingItemObjects;

        // If the request body was valid we will create the listingItem
        const listingItem = await this.listingItemRepo.create(body);

        // create related models
        if (!_.isEmpty(itemInformation)) {
            itemInformation.listing_item_id = listingItem.Id;
            await this.itemInformationService.create(itemInformation as ItemInformationCreateRequest);
        }

        if (!_.isEmpty(paymentInformation)) {
            paymentInformation.listing_item_id = listingItem.Id;
            await this.paymentInformationService.create(paymentInformation as PaymentInformationCreateRequest);
        }

        for (const msgInfo of messagingInformation) {
            msgInfo.listing_item_id = listingItem.Id;
            await this.messagingInformationService.create(msgInfo as MessagingInformationCreateRequest);
        }

        // create listingItemObjects
        for (const object of listingItemObjects) {
            object.listing_item_id = listingItem.Id;
            await this.listingItemObjectService.create(object as ListingItemObjectCreateRequest);
        }

        // finally find and return the created listingItem
        return await this.findOne(listingItem.Id);
    }

    /**
     *
     * @param id
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async update(id: number, @request(ListingItemUpdateRequest) data: ListingItemUpdateRequest): Promise<ListingItem> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('updating ListingItem, body: ', JSON.stringify(body, null, 2));

        // find the existing one without related
        const listingItem = await this.findOne(id, false);

        // set new values
        listingItem.Hash = body.hash;

        // and update the ListingItem record
        const updatedListingItem = await this.listingItemRepo.update(id, listingItem.toJSON());

        // update related ItemInformation
        // if the related one exists allready, then update. if it doesnt exist, create.
        // and if the related one is missing, then remove.
        let itemInformation = updatedListingItem.related('ItemInformation').toJSON() as ItemInformationUpdateRequest;
        if (!_.isEmpty(body.itemInformation)) {
            if (!_.isEmpty(itemInformation)) {
                const itemInformationId = itemInformation.id;
                itemInformation = body.itemInformation;
                itemInformation.listing_item_id = id;
                await this.itemInformationService.update(itemInformationId, itemInformation);
            } else {
                itemInformation = body.itemInformation;
                itemInformation.listing_item_id = id;
                await this.itemInformationService.create(itemInformation as ItemInformationCreateRequest);
            }
        } else if (!_.isEmpty(itemInformation)) {
            await this.itemInformationService.destroy(itemInformation.id);
        }

        // update related PaymentInformation
        // if the related one exists allready, then update. if it doesnt exist, create.
        // and if the related one is missing, then remove.
        let paymentInformation = updatedListingItem.related('PaymentInformation').toJSON() as PaymentInformationUpdateRequest;

        if (!_.isEmpty(body.paymentInformation)) {
            if (!_.isEmpty(paymentInformation)) {
                const paymentInformationId = paymentInformation.id;
                paymentInformation = body.paymentInformation;
                paymentInformation.listing_item_id = id;
                await this.paymentInformationService.update(paymentInformationId, paymentInformation);
            } else {
                paymentInformation = body.paymentInformation;
                paymentInformation.listing_item_id = id;
                await this.paymentInformationService.create(paymentInformation as PaymentInformationCreateRequest);
            }
        } else if (!_.isEmpty(paymentInformation)) {
            await this.paymentInformationService.destroy(paymentInformation.id);
        }

        // MessagingInformation
        const existingMessagingInformations = updatedListingItem.related('MessagingInformation').toJSON() || [];
        const newMessagingInformation = body.messagingInformation || [];

        // delete MessagingInformation if not exist with new params
        for (const msgInfo of existingMessagingInformations) {
            if (!await this.checkExistingObject(newMessagingInformation, 'publicKey', msgInfo.publicKey)) {
                await this.messagingInformationService.destroy(msgInfo.id);
            }
        }

        // update or create MessagingInformation
        for (const msgInfo of newMessagingInformation) {
            msgInfo.listing_item_id = id;
            const message = await this.checkExistingObject(existingMessagingInformations, 'publicKey', msgInfo.publicKey);
            if (message) {
                message.protocol = msgInfo.protocol;
                message.publicKey = msgInfo.publicKey;
                await this.messagingInformationService.update(message.id, msgInfo as MessagingInformationUpdateRequest);
            } else {
                await this.messagingInformationService.create(msgInfo as MessagingInformationCreateRequest);
            }
        }

        const newListingItemObjects = body.listingItemObjects || [];

        // find related listingItemObjects
        const existingListingItemObjects = updatedListingItem.related('ListingItemObjects').toJSON() || [];

        // find highestOrderNumber
        const highestOrderNumber = await this.findHighestOrderNumber(newListingItemObjects);

        const objectsToBeUpdated = [] as any;
        for (const object of existingListingItemObjects) {
            // check if order number is greter than highestOrderNumber then delete
            if (object.order > highestOrderNumber) {
                await this.listingItemObjectService.destroy(object.id);
            } else {
                objectsToBeUpdated.push(object);
            }
        }
        // create or update listingItemObjects
        for (const object of newListingItemObjects) {
            object.listing_item_id = id;
            const itemObject = await this.checkExistingObject(objectsToBeUpdated, 'order', object.order);

            if (itemObject) {
                await this.listingItemObjectService.update(itemObject.id, object as ListingItemObjectUpdateRequest);
            } else {
                await this.listingItemObjectService.create(object as ListingItemObjectCreateRequest);
            }
        }

        // finally find and return the updated listingItem
        return await this.findOne(id);
    }

    /**
     *
     * @param id
     * @returns {Promise<void>}
     */
    public async destroy(id: number): Promise<void> {
        const listingItemModel = await this.findOne(id, true);
        if (!listingItemModel) {
            throw new NotFoundException('Item listing does not exist. id = ' + id);
        }
        const listingItem = listingItemModel.toJSON();
        this.log.debug('delete listingItem:', listingItem.id);

        await this.listingItemRepo.destroy(id);

        // remove related CryptocurrencyAddress if it exists
        if (listingItem.PaymentInformation && listingItem.PaymentInformation.ItemPrice
            && listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress) {
            this.log.debug('delete listingItem cryptocurrencyaddress:', listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.id);
            await this.cryptocurrencyAddressService.destroy(listingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress.id);
        }
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

        const listingItemMessage = await this.listingItemFactory.getMessage(itemTemplate, itemCategory);

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
     * processes newly received ListingItemMessage
     *
     * @param {MarketplaceMessageInterface} message
     * @returns {Promise<"resources".ListingItem>}
     */
    public async process(message: MarketplaceMessage): Promise<resources.ListingItem> {
        this.log.info('Received event ListingItemReceivedListener:', message);

        if (message.market && message.item) {
            // get market
            const marketModel = await this.marketService.findByAddress(message.market);
            const market = marketModel.toJSON();

            const listingItemMessage = message.item;
            // create the new custom categories in case there are some
            const itemCategory: resources.ItemCategory = await this.getOrCreateCategories(listingItemMessage.information.category);

            // find the categories/get the root category with related
            const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
            const rootCategory = rootCategoryWithRelatedModel.toJSON();

            // create ListingItem
            const listingItemCreateRequest = await this.listingItemFactory.getModel(listingItemMessage, market.id, rootCategory);
            // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));

            const listingItemModel = await this.create(listingItemCreateRequest);
            const listingItem = listingItemModel.toJSON();

            // emit the latest message event to cli
            // this.eventEmitter.emit('cli', {
            //    message: 'new ListingItem received: ' + JSON.stringify(listingItem)
            // });

            // this.log.debug('new ListingItem received: ' + JSON.stringify(listingItem));
            return listingItem;

        } else {
            throw new MessageException('Marketplace message missing market.');
        }
    }

    // check if ListingItem already Flagged
    public async isItemFlagged(listingItem: ListingItem): Promise<boolean> {
        const flaggedItem = listingItem.related('FlaggedItem').toJSON();
        return _.size(flaggedItem) !== 0;
    }


    /**
     * create categories from array and will return last category <ItemCategory> Model
     *
     * @param categoryArray : string[]
     * @returns {Promise<ItemCategory>}
     */
    private async getOrCreateCategories(categoryArray: string[]): Promise<resources.ItemCategory> {

        const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
        let rootCategoryToSearchFrom = rootCategoryWithRelatedModel.toJSON();

        for (const categoryKeyOrName of categoryArray) { // [cat0, cat1, cat2, cat3, cat4]

            let existingCategory = await this.findCategory(rootCategoryToSearchFrom, categoryKeyOrName);

            if (!existingCategory) {

                // category did not exist, so we need to create it
                const categoryCreateRequest = {
                    name: categoryKeyOrName,
                    parent_item_category_id: rootCategoryToSearchFrom.id
                } as ItemCategoryCreateRequest;

                // create and assign it as existingCategoru
                const newCategory = await this.itemCategoryService.create(categoryCreateRequest);
                existingCategory = newCategory.toJSON();

            } else {
                // category exists, fetch it
                const existingCategoryModel = await this.itemCategoryService.findOneByKey(categoryKeyOrName);
                existingCategory = existingCategoryModel.toJSON();
            }
            rootCategoryToSearchFrom = existingCategory;
        }

        // return the last catego
        return rootCategoryToSearchFrom;
    }

    /**
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    private async findCategory(rootCategory: resources.ItemCategory, keyOrName: string): Promise<resources.ItemCategory> {

        if (rootCategory.key === keyOrName) {
            // root case
            return rootCategory;
        } else {
            // search the children for a match
            const childCategories = rootCategory.ChildItemCategories;
            return _.find(childCategories, (childCategory) => {
                return (childCategory['key'] === keyOrName || childCategory['name'] === keyOrName);
            });
        }
    }

    // check if object is exist in a array
    private async checkExistingObject(objectArray: string[], fieldName: string, value: string | number): Promise<any> {
        return await _.find(objectArray, (object) => {
            return ( object[fieldName] === value );
        });
    }

    // find highest order number from listingItemObjects
    private async findHighestOrderNumber(listingItemObjects: string[]): Promise<any> {
        const highestOrder = await _.maxBy(listingItemObjects, (itemObject) => {
          return itemObject['order'];
        });
        return highestOrder ? highestOrder['order'] : 0;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on('ListingItemReceivedEvent', async (event) => {
            await this.process(event);
        });

    }

}
