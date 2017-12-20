import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategory } from '../models/ItemCategory';
import { MessageException } from '../exceptions/MessageException';

export class ItemCategoryFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * data:
     *  categoryAsArray: []
     *  rootCategoryWithRelated: ItemCategory
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    public async get(categoryAsArray: string[], rootCategoryWithRelated: ItemCategory): Promise<ItemCategory> {
        const rootCategory: any = rootCategoryWithRelated;
        // check cat1 match with root itemcategory.key
        if (categoryAsArray[0] !== rootCategory.Key) {
            throw new MessageException(`${categoryAsArray[0]} should be root ItemCategory`);
        }
        // check cat2 is matching with ItemCategory.ItemCategories
        let innerItemCategories = rootCategory.ChildItemCategories;
        // check with key and name
        const itemCategory2 = await this.checkCategory(innerItemCategories, categoryAsArray[1]);

        let needToBeCreated: any = [];
        if (itemCategory2) {
            innerItemCategories = itemCategory2['ChildItemCategories'];
            // check with key and name
            const itemCategory3 = await this.checkCategory(innerItemCategories, categoryAsArray[2]);
            if (!itemCategory3) {
                needToBeCreated.push({
                    parent_item_category_id: innerItemCategories.id,
                    name: categoryAsArray[2]
                });
            } else {
                needToBeCreated = {
                    ItemCategory: itemCategory3['id']
                };
            }
        } else {
            needToBeCreated.push({
                parent_item_category_id: rootCategory.id,
                name: categoryAsArray[1]
            });
            needToBeCreated.push({
                parent_item_category_id: '0',
                name: categoryAsArray[2]
            });
        }
        return needToBeCreated as any;
    }

    private async checkCategory(categories: string[], value: string): Promise<any> {
        return _.find(categories, (itemcategory) => {
            return (itemcategory['Key'] === value || itemcategory['name'] === value);
        });
    }
}
