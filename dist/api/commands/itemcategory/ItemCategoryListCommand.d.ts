import { Logger as LoggerType } from '../../../core/Logger';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemCategoryListCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {
    Logger: typeof LoggerType;
    private itemCategoryService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemCategoryService: ItemCategoryService);
    /**
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    execute(data: RpcRequest): Promise<ItemCategory>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
