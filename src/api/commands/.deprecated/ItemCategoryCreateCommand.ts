import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import {RpcCommand} from '../RpcCommand';

export class ItemCategoryCreateCommand implements RpcCommand<ItemCategory> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemcategory.create';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemCategory> {
        const parentItemCategory = data.params[2] || 'cat_ROOT'; // if null then default_category will be parent
        const parentItemCategoryId = await this.getCategoryIdByKey(parentItemCategory);
        return await this.itemCategoryService.create({
            name: data.params[0],
            description: data.params[1],
            parent_item_category_id: parentItemCategoryId
        });
    }

    public help(): string {
        return 'ItemCategoryCreateCommand: TODO: Fill in help string.';
    }

    /**
     * function to return category id
     * TODO: NOTE: This function may be duplicated between commands.
     *
     * @param data
     * @returns {Promise<number>}
     */
    private async getCategoryIdByKey(parentItemCategory: any): Promise<number> {
        let parentItemCategoryId;
        if (typeof parentItemCategory === 'number') {
            parentItemCategoryId = parentItemCategory;
        } else { // get category id by key
            parentItemCategory = await this.itemCategoryService.findOneByKey(parentItemCategory);
            parentItemCategoryId = parentItemCategory.id;
        }
        return parentItemCategoryId;
    }
}
