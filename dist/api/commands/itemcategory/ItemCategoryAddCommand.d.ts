import { Logger as LoggerType } from '../../../core/Logger';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemCategoryAddCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {
    Logger: typeof LoggerType;
    private itemCategoryService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemCategoryService: ItemCategoryService);
    /**
     * creates a new user defined category, these don't have a key and they always need to have a parent_item_category_id
     *
     * data.params[]:
     *  [0]: category name
     *  [1]: description
     *  [2]: parent_item_category_id id/key
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
     * function to return category id
     * TODO: NOTE: This function may be duplicated between commands.
     *
     * @param data
     * @returns {Promise<number>}
     */
    private getCategoryIdByKey(parentItemCategory);
}
