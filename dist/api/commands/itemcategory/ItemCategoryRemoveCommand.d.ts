import { Logger as LoggerType } from '../../../core/Logger';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { ListingItemService } from '../../services/ListingItemService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemCategoryRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    private itemCategoryService;
    private listingItemService;
    private listingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemCategoryService: ItemCategoryService, listingItemService: ListingItemService, listingItemTemplateService: ListingItemTemplateService);
    /**
     * remove user defined category
     * data.params[]:
     *  [0]: category id
     *
     * @param data
     * @returns {Promise<void>}
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
    /**
     * function to check category is default, check category is not associated with listing-item
     *
     * @param data
     * @returns {Promise<boolean>}
     */
    private isDoable(categoryId);
}
