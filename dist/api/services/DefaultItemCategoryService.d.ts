import { Logger as LoggerType } from '../../core/Logger';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import { ItemCategory } from '../models/ItemCategory';
export declare class DefaultItemCategoryService {
    itemCategoryService: ItemCategoryService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(itemCategoryService: ItemCategoryService, Logger: typeof LoggerType);
    seedDefaultCategories(): Promise<void>;
    insertOrUpdateCategory(category: ItemCategoryCreateRequest): Promise<ItemCategory>;
    getPath(category: ItemCategory): Promise<string>;
}
