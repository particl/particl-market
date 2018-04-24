/// <reference types="node" />
import { Logger as LoggerType } from '../../core/Logger';
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
import { ListingItemObjectService } from './ListingItemObjectService';
import { FlaggedItemService } from './FlaggedItemService';
import * as resources from 'resources';
import { EventEmitter } from 'events';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { ListingItemService } from './ListingItemService';
import { ActionMessageService } from './ActionMessageService';
export declare class ListingItemActionService {
    marketService: MarketService;
    cryptocurrencyAddressService: CryptocurrencyAddressService;
    itemInformationService: ItemInformationService;
    itemCategoryService: ItemCategoryService;
    paymentInformationService: PaymentInformationService;
    messagingInformationService: MessagingInformationService;
    listingItemTemplateService: ListingItemTemplateService;
    listingItemService: ListingItemService;
    listingItemObjectService: ListingItemObjectService;
    smsgService: SmsgService;
    flaggedItemService: FlaggedItemService;
    actionMessageService: ActionMessageService;
    private listingItemFactory;
    eventEmitter: EventEmitter;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(marketService: MarketService, cryptocurrencyAddressService: CryptocurrencyAddressService, itemInformationService: ItemInformationService, itemCategoryService: ItemCategoryService, paymentInformationService: PaymentInformationService, messagingInformationService: MessagingInformationService, listingItemTemplateService: ListingItemTemplateService, listingItemService: ListingItemService, listingItemObjectService: ListingItemObjectService, smsgService: SmsgService, flaggedItemService: FlaggedItemService, actionMessageService: ActionMessageService, listingItemFactory: ListingItemFactory, eventEmitter: EventEmitter, Logger: typeof LoggerType);
    /**
     * post a ListingItem based on a given ListingItem as ListingItemMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    post(data: ListingItemTemplatePostRequest): Promise<SmsgSendResponse>;
    /**
     * update a ListingItem based on a given ListingItem as ListingItemUpdateMessage
     *
     * @param data
     * @returns {Promise<void>}
     */
    updatePostItem(data: ListingItemUpdatePostRequest): Promise<void>;
    /**
     * processes received ListingItemMessage
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<"resources".ListingItem>}
     */
    processListingItemReceivedEvent(event: MarketplaceEvent): Promise<resources.ListingItem>;
    private configureEventListeners();
}
