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
     * @param categoryName : string
     * @param parentId : number
     * @returns {Promise<ItemCategoryCreateRequest>}
     */
    public async getModel(categoryName: string, parentId: number): Promise<ItemCategoryCreateRequest> {
        return {
            name: categoryName,
            parent_item_category_id: parentId
        } as ItemCategoryCreateRequest;
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
