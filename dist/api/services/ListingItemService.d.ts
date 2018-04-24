/// <reference types="node" />
import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
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
import { ListingItemTemplateService } from './ListingItemTemplateService';
import { ListingItemFactory } from '../factories/ListingItemFactory';
import { SmsgService } from './SmsgService';
import { ListingItemObjectService } from './ListingItemObjectService';
import { FlaggedItemService } from './FlaggedItemService';
import { EventEmitter } from 'events';
import { ActionMessageService } from './ActionMessageService';
export declare class ListingItemService {
    marketService: MarketService;
    cryptocurrencyAddressService: CryptocurrencyAddressService;
    itemInformationService: ItemInformationService;
    itemCategoryService: ItemCategoryService;
    paymentInformationService: PaymentInformationService;
    messagingInformationService: MessagingInformationService;
    listingItemTemplateService: ListingItemTemplateService;
    listingItemObjectService: ListingItemObjectService;
    smsgService: SmsgService;
    flaggedItemService: FlaggedItemService;
    actionMessageService: ActionMessageService;
    private listingItemFactory;
    listingItemRepo: ListingItemRepository;
    eventEmitter: EventEmitter;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(marketService: MarketService, cryptocurrencyAddressService: CryptocurrencyAddressService, itemInformationService: ItemInformationService, itemCategoryService: ItemCategoryService, paymentInformationService: PaymentInformationService, messagingInformationService: MessagingInformationService, listingItemTemplateService: ListingItemTemplateService, listingItemObjectService: ListingItemObjectService, smsgService: SmsgService, flaggedItemService: FlaggedItemService, actionMessageService: ActionMessageService, listingItemFactory: ListingItemFactory, listingItemRepo: ListingItemRepository, eventEmitter: EventEmitter, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ListingItem>>;
    findByCategory(categoryId: number): Promise<Bookshelf.Collection<ListingItem>>;
    findOne(id: number, withRelated?: boolean): Promise<ListingItem>;
    /**
     *
     * @param {string} hash
     * @param {boolean} withRelated
     * @returns {Promise<ListingItem>}
     */
    findOneByHash(hash: string, withRelated?: boolean): Promise<ListingItem>;
    /**
     * search ListingItems using given ListingItemSearchParams
     *
     * @param {ListingItemSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<ListingItem>>}
     */
    search(options: ListingItemSearchParams, withRelated?: boolean): Promise<Bookshelf.Collection<ListingItem>>;
    /**
     *
     * @param {ListingItemCreateRequest} data
     * @returns {Promise<ListingItem>}
     */
    create(data: ListingItemCreateRequest): Promise<ListingItem>;
    /**
     *
     * @param {number} id
     * @param {ListingItemUpdateRequest} data
     * @returns {Promise<ListingItem>}
     */
    update(id: number, data: ListingItemUpdateRequest): Promise<ListingItem>;
    updateListingItemTemplateRelation(id: number): Promise<ListingItem>;
    /**
     *
     * @param {number} id
     * @returns {Promise<void>}
     */
    destroy(id: number): Promise<void>;
    /**
     * check if ListingItem already Flagged
     *
     * @param {ListingItem} listingItem
     * @returns {Promise<boolean>}
     */
    isItemFlagged(listingItem: ListingItem): Promise<boolean>;
    /**
     * check if object is exist in a array
     *
     * @param {string[]} objectArray
     * @param {string} fieldName
     * @param {string | number} value
     * @returns {Promise<any>}
     */
    private checkExistingObject(objectArray, fieldName, value);
    /**
     * find highest order number from listingItemObjects
     *
     * @param {string[]} listingItemObjects
     * @returns {Promise<any>}
     */
    private findHighestOrderNumber(listingItemObjects);
}
