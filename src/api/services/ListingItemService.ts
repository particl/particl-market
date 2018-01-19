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
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { MarketService } from './MarketService';
import { ListingItemSearchParams } from '../requests/ListingItemSearchParams';

import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../requests/ItemInformationUpdateRequest';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../requests/PaymentInformationUpdateRequest';
import { MessagingInformationCreateRequest } from '../requests/MessagingInformationCreateRequest';
import { ListingItemPostRequest } from '../requests/ListingItemPostRequest';
import { ListingItemObjectCreateRequest } from '../requests/ListingItemObjectCreateRequest';
import { ListingItemObjectUpdateRequest } from '../requests/ListingItemObjectUpdateRequest';

import { ListingItemTemplateService } from './ListingItemTemplateService';
import { MessageException } from '../exceptions/MessageException';
import { ListingItemFactory } from '../factories/ListingItemFactory';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { MessageBroadcastService } from './MessageBroadcastService';
import { Market } from '../models/Market';
import { ListingItemObjectService } from './ListingItemObjectService';

export class ListingItemService {

    public log: LoggerType;

    constructor(@inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
                @inject(Types.Service) @named(Targets.Service.CryptocurrencyAddressService) public cryptocurrencyAddressService: CryptocurrencyAddressService,
                @inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
                @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
                @inject(Types.Service) @named(Targets.Service.MessagingInformationService) public messagingInformationService: MessagingInformationService,
                @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
                @inject(Types.Service) @named(Targets.Service.ListingItemObjectService) public listingItemObjectService: ListingItemObjectService,
                @inject(Types.Service) @named(Targets.Service.MessageBroadcastService) public messageBroadcastService: MessageBroadcastService,
                @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) private listingItemFactory: ListingItemFactory,
                @inject(Types.Repository) @named(Targets.Repository.ListingItemRepository) public listingItemRepo: ListingItemRepository,
                @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
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
                        withRelated: boolean = false): Promise<Bookshelf.Collection<ListingItem>> {
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
    public async create(@request(ListingItemCreateRequest) data: ListingItemCreateRequest): Promise<ListingItem> {

        const body = JSON.parse(JSON.stringify(data));

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

        // find the existing one without related
        const listingItem = await this.findOne(id, false);

        // set new values
        listingItem.Hash = body.hash;

        // update listingItem record
        const updatedListingItem = await this.listingItemRepo.update(id, listingItem.toJSON());

        // Item-information
        let itemInformation = updatedListingItem.related('ItemInformation').toJSON() || {};
        // if the related one exists allready, then update. if it doesnt exist, create. and if the related one is missing, then remove.
        if (!_.isEmpty(body.itemInformation)) {
            if (!_.isEmpty(itemInformation)) {
                const itemInformationId = itemInformation.id;
                itemInformation = body.itemInformation;
                itemInformation.listing_item_id = id;
                await this.itemInformationService.update(itemInformationId, itemInformation as ItemInformationUpdateRequest);
            } else {
                itemInformation = body.itemInformation;
                itemInformation.listing_item_id = id;
                await this.itemInformationService.create(itemInformation as ItemInformationCreateRequest);
            }
        } else if (!_.isEmpty(itemInformation)) {
            await this.itemInformationService.destroy(itemInformation.id);
        }

        // payment-information
        let paymentInformation = updatedListingItem.related('PaymentInformation').toJSON() || {};

        if (!_.isEmpty(body.paymentInformation)) {
            if (!_.isEmpty(paymentInformation)) {
                const paymentInformationId = paymentInformation.id;
                paymentInformation = body.paymentInformation;
                paymentInformation.listing_item_id = id;
                await this.paymentInformationService.update(paymentInformationId, paymentInformation as PaymentInformationUpdateRequest);
            } else {
                paymentInformation = body.paymentInformation;
                paymentInformation.listing_item_id = id;
                await this.paymentInformationService.create(paymentInformation as PaymentInformationCreateRequest);
            }
        } else if (!_.isEmpty(paymentInformation)) {
            await this.paymentInformationService.destroy(paymentInformation.id);
        }

        // find related record and delete it and recreate related data
        let messagingInformation = updatedListingItem.related('MessagingInformation').toJSON() || [];
        for (const msgInfo of messagingInformation) {
            await this.messagingInformationService.destroy(msgInfo.id);
        }
        messagingInformation = body.messagingInformation || [];
        for (const msgInfo of messagingInformation) {
            msgInfo.listing_item_id = id;
            await this.messagingInformationService.create(msgInfo as MessagingInformationCreateRequest);
        }

        // find related record and delete it and recreate related data
        let listingItemObjects = updatedListingItem.related('ListingItemObjects').toJSON() || [];

        for (const object of listingItemObjects) {
            object.listing_item_id = id;
            await this.listingItemObjectService.destroy(object.id);
        }

        // add new
        listingItemObjects = body.listingItemObjects || [];
        for (const object of listingItemObjects) {
            object.listing_item_id = id;
            await this.listingItemObjectService.create(object as ListingItemObjectCreateRequest);
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
        const item = await this.findOne(id, true);
        if (!item) {
            throw new NotFoundException('Item listing does not exist. id = ' + id);
        }
        const paymentInfo = item.PaymentInformation();
        if (paymentInfo) {
            const itemPrice = paymentInfo.ItemPrice();
            const cryptoAddress = itemPrice.CryptocurrencyAddress();
            if (!cryptoAddress) {
                throw new NotFoundException('Payment information without cryptographic address. PaymentInfo.id = ' + paymentInfo.id);
            }
            this.cryptocurrencyAddressService.destroy(cryptoAddress.Id);
        }
        await this.listingItemRepo.destroy(id);
    }

    /**
     * post a ListingItem based on a given ListingItem as ListingItemMessage
     *
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async post(@request(ListingItemPostRequest) data: ListingItemPostRequest): Promise<void> {

        // fetch the listingItemTemplate
        const itemTemplateModel = await this.findOne(data.listingItemTemplateId);
        const itemTemplate = itemTemplateModel.toJSON();

        // fetch the market, dont remove, will be used later with the broadcast
        const marketModel: Market = await _.isEmpty(data.marketId)
        ? await this.marketService.getDefault()
        : await this.marketService.findOne(data.marketId);
        const market = marketModel.toJSON();

        // create ListingItemMessage
        const addItemMessage = await this.listingItemFactory.getMessage(itemTemplate);

        // TODO: Need to update broadcast message return after broadcast functionality will be done.
        this.messageBroadcastService.broadcast(addItemMessage as ListingItemMessage);
        return itemTemplate;

    }
}
