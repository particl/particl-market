import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategory } from '../models/ItemCategory';

import { ItemCategoryService } from '../services/ItemCategoryService';

export class ItemCategoryFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async get(data: any): Promise<ItemCategory> {
        // find/create category
        const categoryData = data;
        const newCatData = {
            parent_item_category_id: '0',
            name: ''
        };
        let newCat;
        let catExist;
        for (const cat of categoryData) {
            // check category exist
            catExist = await this.itemCategoryService.findOneByKey(cat);
            if (catExist == null) {
                newCatData.name = cat;
                newCat = await this.itemCategoryService.create(newCatData);
                newCatData.parent_item_category_id = newCat.id;
            } else {
                newCatData.parent_item_category_id = catExist.id;
                newCat = catExist;
            }
        }
        return newCat.id;
    }

}
