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
    private categoryArray: any;
    private isFound: boolean;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param category : resources.ItemCategory
     * @param rootCategoryWithRelated : ItemCategory
     * @returns {Promise<string[]>}
     */
    public async getArray(category: resources.ItemCategory, rootCategoryWithRelated: ItemCategory): Promise<string[]> {
        const rootCategory: any = rootCategoryWithRelated;
        this.categoryArray = [];
        this.isFound = false;
        if (rootCategory.id === category.parentItemCategoryId) { // rootcategory
            this.categoryArray = [rootCategory.key];
        } else {
            await this.getInnerCategory(rootCategory, category.parentItemCategoryId);
        }
        this.categoryArray.push(category.key);
        return this.categoryArray;
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
     * check the category in whole tree and return array of key from root to matching category
     *
     * @param theObject : ItemCategory
     * @param findValue : number(parent_item_category_id)
     * @returns {Promise<string[]>}
     */
    private async getInnerCategory(theObject: ItemCategory, findValue: number): Promise<string[]> {
        const childCategories: any = theObject.ChildItemCategories;
        if (childCategories.length > 0) {
            for (const childCategory of childCategories) {
                if (!this.isFound) {
                    this.categoryArray.push(theObject.Key);
                }
                if (childCategory.parentItemCategoryId === findValue) {
                    this.isFound = true;
                    break;
                } else if (!this.isFound) {
                    await this.getInnerCategory(childCategory, findValue);
                }
            }
        } else {
            this.categoryArray = [];
        }
        return this.categoryArray as any;
    }
}
