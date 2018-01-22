import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategory } from '../models/ItemCategory';
import { ItemCategoryMessage } from '../messages/ItemCategoryMessage';
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
     * @param category : ItemCategoryMessage
     * @returns {Promise<ItemCategoryCreateRequest>}
     */
    public async getModel(category: ItemCategoryMessage): Promise<ItemCategoryCreateRequest> {
        return {
            parent_item_category_id: category.parentItemCategoryId,
            name: category.name
        } as ItemCategoryCreateRequest;
    }

    private async getInnerCategory(theObject: any, findValue: number): Promise<void> {
        const childCategories = theObject.ChildItemCategories;
        if (childCategories.length > 0) {
            for (const childCategory of childCategories) {
                if (!this.isFound) {
                    this.categoryArray.push(theObject.key);
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
