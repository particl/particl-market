import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategory } from '../models/ItemCategory';
import { MessageException } from '../exceptions/MessageException';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import * as resources from 'resources';

export class ItemCategoryFactory {

    public log: LoggerType;
    private isFound: boolean;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * Converts a category to an array of category keys
     * ['rootcatkey', 'subcatkey', ..., 'catkey']
     *
     * @param category : resources.ItemCategory
     * @param rootCategoryWithRelated : resources.ItemCategory
     * @returns {Promise<string[]>}
     */
    public async getArray(category: resources.ItemCategory): Promise<string[]> {
        return await this.getArrayInner(category);
    }

    /**
     *
     * @param {string[]} categoryArray
     * @param {"resources".ItemCategory} rootCategory
     * @returns {Promise<"resources".ItemCategory>}
     */
    public async getModel(categoryArray: string[], rootCategory: resources.ItemCategory): Promise<ItemCategoryCreateRequest> {
        for (const categoryKeyOrName of categoryArray) {
            rootCategory = await this.findCategory(rootCategory, categoryKeyOrName);
        }
        return {
            parent_item_category_id: rootCategory.parentItemCategoryId,
            key: rootCategory.key,
            name: rootCategory.name,
            description: rootCategory.description
        } as ItemCategoryCreateRequest;
    }

    /**
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    private async findCategory(rootCategory: resources.ItemCategory, keyOrName: string): Promise<resources.ItemCategory> {

        if (rootCategory.key === keyOrName) {
            // root case
            return rootCategory;
        } else {
            // search the children for a match
            const childCategories = rootCategory.ChildItemCategories;
            return _.find(childCategories, (childCategory) => {
                return (childCategory['key'] === keyOrName || childCategory['name'] === keyOrName);
            });
        }
    }

    /**
     *
     * @param {"resources".ItemCategory} category
     * @param {string[]} categoryArray
     * @returns {Promise<string[]>}
     */
    private async getArrayInner(category: resources.ItemCategory, categoryArray: string[] = []): Promise<string[]> {

        // add category key to beginning of the array
        categoryArray.unshift(category.key);

        // if category has ParentItemCategory, add it's key to array
        if (!_.isEmpty(category.ParentItemCategory)) {
            return await this.getArrayInner(category.ParentItemCategory, categoryArray);
        }
        return categoryArray;
    }
}
