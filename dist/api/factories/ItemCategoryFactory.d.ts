import { Logger as LoggerType } from '../../core/Logger';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import * as resources from 'resources';
export declare class ItemCategoryFactory {
    Logger: typeof LoggerType;
    log: LoggerType;
    private isFound;
    constructor(Logger: typeof LoggerType);
    /**
     * Converts a category to an array of category keys
     * ['rootcatkey', 'subcatkey', ..., 'catkey']
     *
     * @param category : resources.ItemCategory
     * @param rootCategoryWithRelated : resources.ItemCategory
     * @returns {Promise<string[]>}
     */
    getArray(category: resources.ItemCategory): Promise<string[]>;
    /**
     *
     * @param {string[]} categoryArray
     * @param {"resources".ItemCategory} rootCategory
     * @returns {Promise<"resources".ItemCategory>}
     */
    getModel(categoryArray: string[], rootCategory: resources.ItemCategory): Promise<ItemCategoryCreateRequest>;
    /**
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    private findCategory(rootCategory, keyOrName);
    /**
     *
     * @param {"resources".ItemCategory} category
     * @param {string[]} categoryArray
     * @returns {Promise<string[]>}
     */
    private getArrayInner(category, categoryArray?);
}
