import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategory } from '../models/ItemCategory';
import { MessageException } from '../exceptions/MessageException';
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
     * @param categoryAsArray
     * @param rootCategoryWithRelated
     * @returns {Promise<any>}
     */
    public async getModel(categoryAsArray: string[], rootCategoryWithRelated: ItemCategory): Promise<ItemCategory> {
        const rootCategory: any = rootCategoryWithRelated;
        let childItemCategories;
        const createdCategories: any = [];
        let findItemCategory;
        let lastCheckIndex = 0;
        // check cat1 match with root itemcategory.key
        if (categoryAsArray[0] !== rootCategory.key) { // cat_ROOT
            this.log.warn(`${categoryAsArray[0]} should be root ItemCategory`);
        }
        // insert root category
        createdCategories.push({
            parentCategoryId: null,
            id: rootCategory.id
        });
        childItemCategories = rootCategory.ChildItemCategories;
        for (let c = 1; c <= categoryAsArray.length; c++) {
            // check category have ChildItemCategories
            if (childItemCategories.length > 0) {
                // search catgeory
                findItemCategory = await this.checkCategory(childItemCategories, categoryAsArray[c]);
                if (findItemCategory) {
                    createdCategories.push({
                        parentCategoryId: findItemCategory.parentItemCategoryId,
                        id: findItemCategory.id
                    });
                    childItemCategories = findItemCategory.ChildItemCategories || [];
                } else {
                    // created all category till from
                    break;
                }
            } else {
                // created all category till from
                break;
            }
            lastCheckIndex = c;
        }
        const ItemCategoryOutput = {
            lastCheckIndex, // created all category till that index
            createdCategories
        };
        return ItemCategoryOutput as any;
    }

    private async checkCategory(categories: string[], value: string): Promise<any> {
        return _.find(categories, (itemcategory) => {
            return (itemcategory['key'] === value || itemcategory['name'] === value);
        });
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
