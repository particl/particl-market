/// <reference types="node" />
import { Logger as LoggerType } from '../../../core/Logger';
import { MessageProcessorInterface } from '../MessageProcessorInterface';
import { ListingItemFactory } from '../../factories/ListingItemFactory';
import { ListingItemService } from '../../services/ListingItemService';
import { ItemCategoryFactory } from '../../factories/ItemCategoryFactory';
import { MessagingInformationFactory } from '../../factories/MessagingInformationFactory';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { MarketService } from '../../services/MarketService';
import { ListingItemMessage } from '../../messages/ListingItemMessage';
import { EventEmitter } from '../../../core/api/events';
import * as resources from 'resources';
export declare class UpdateListingItemMessageProcessor implements MessageProcessorInterface {
    listingItemFactory: ListingItemFactory;
    itemCategoryFactory: ItemCategoryFactory;
    mesInfoFactory: MessagingInformationFactory;
    listingItemService: ListingItemService;
    itemCategoryService: ItemCategoryService;
    marketService: MarketService;
    eventEmitter: EventEmitter;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(listingItemFactory: ListingItemFactory, itemCategoryFactory: ItemCategoryFactory, mesInfoFactory: MessagingInformationFactory, listingItemService: ListingItemService, itemCategoryService: ItemCategoryService, marketService: MarketService, eventEmitter: EventEmitter, Logger: typeof LoggerType);
    process(listingItemMessage: ListingItemMessage, marketAddress: string): Promise<resources.ListingItem>;
    /**
     * TODO: move to service
     * create categories from array and will return last category <ItemCategory> Model
     *
     * @param categoryArray : string[]
     * @returns {Promise<ItemCategory>}
     */
    private getOrCreateCategories(categoryArray);
    /**
     * TODO: move to service
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    private findCategory(rootCategory, keyOrName);
}
