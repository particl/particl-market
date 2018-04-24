import { Logger as LoggerType } from '../../../core/Logger';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemCategoryUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {
    Logger: typeof LoggerType;
    private itemCategoryService;
    private listingItemService;
    log: LoggerType;
    name: string;
    helpStr: string;
    constructor(Logger: typeof LoggerType, itemCategoryService: ItemCategoryService, listingItemService: ListingItemService);
    /**
     * updates user defined category
     *
     * data.params[]:
     *  [0]: category id
     *  [1]: category name
     *  [2]: description
     *  [3]: parentItemCategoryId
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    execute(data: RpcRequest): Promise<ItemCategory>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
    /**
     * function to check category is default, check category is not associated with listing-item
     * TODO: NOTE: This function may be duplicated between commands.
     *
     * @param data
     * @returns {Promise<boolean>}
     */
    private isDoable(categoryId);
    /**
     * function to return category id
     * TODO: NOTE: This function may be duplicated between commands.
     *
     * @param data
     * @returns {Promise<number>}
     */
    private getCategoryIdByKey(parentItemCategory);
}
