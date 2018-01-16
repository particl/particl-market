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

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getModel(category: resources.ItemCategory, rootCategoryWithRelated: ItemCategory): Promise<string[]> {
        // TODO: implement
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
        if (categoryAsArray[0] !== rootCategory.Key) { // cat_ROOT
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
                        parentCategoryId: findItemCategory.parent_item_category_id,
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
            return (itemcategory['Key'] === value || itemcategory['name'] === value);
        });
    }
}
