/// <reference types="node" />
import { Logger as LoggerType } from '../../../core/Logger';
import { MessageProcessorInterface } from '../MessageProcessorInterface';
import { ListingItemFactory } from '../../factories/ListingItemFactory';
import { ListingItemService } from '../../services/ListingItemService';
import { ItemCategoryFactory } from '../../factories/ItemCategoryFactory';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { EventEmitter } from '../../../core/api/events';
import * as resources from 'resources';
import { ListingItemMessage } from '../../messages/ListingItemMessage';
export declare class ListingItemMessageProcessor implements MessageProcessorInterface {
    listingItemFactory: ListingItemFactory;
    itemCategoryFactory: ItemCategoryFactory;
    listingItemService: ListingItemService;
    itemCategoryService: ItemCategoryService;
    eventEmitter: EventEmitter;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(listingItemFactory: ListingItemFactory, itemCategoryFactory: ItemCategoryFactory, listingItemService: ListingItemService, itemCategoryService: ItemCategoryService, eventEmitter: EventEmitter, Logger: typeof LoggerType);
    process(listingItemMessage: ListingItemMessage, marketAddress: string): Promise<resources.ListingItem>;
}
