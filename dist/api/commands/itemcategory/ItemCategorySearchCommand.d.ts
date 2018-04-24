import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemCategorySearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ItemCategory>> {
    Logger: typeof LoggerType;
    private itemCategoryService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemCategoryService: ItemCategoryService);
    /**
     * data.params[]:
     *  [0]: searchString, string, can't be null
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<ItemCategory>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
