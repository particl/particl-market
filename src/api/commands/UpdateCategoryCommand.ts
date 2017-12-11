import * as Bookshelf from 'bookshelf';
import { injectable, inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { ListingItemService } from '../services/ListingItemService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemCategory } from '../models/ItemCategory';
import {RpcCommand} from './RpcCommand';
import { MessageException } from '../exceptions/MessageException';

// @injectable
export class UpdateCategoryCommand implements RpcCommand<ItemCategory> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'UpdateCategoryCommand';
    }

    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemCategory>> {
        const isUpdateable = await this.isDoable(data.params[0]);
        if (isUpdateable) {
            const parentItemCategory = data.params[3] || 'cat_ROOT'; // if null then default_category will be parent
            const parentItemCategoryId = await this.getCategoryIdByKey(parentItemCategory);
            return await Bookshelf.Collection.apply(this.itemCategoryService.update(data.params[0], {
                name: data.params[1],
                description: data.params[2],
                parent_item_category_id: parentItemCategoryId
            }));
        } else {
            throw new MessageException(`category can't be update. id= ${data.params[0]}`);
        }
    }

    public help(): string {
        return 'UpdateCategoryCommand: TODO: Fill in help string.';
    }

    /**
     * function to check category is default, check category is not associated with listing-item
     * TODO: NOTE: This function may be duplicated between commands.
     *
     * @param data
     * @returns {Promise<boolean>}
     */
    private async isDoable(categoryId: number): Promise<boolean> {
        const itemCategory = await this.itemCategoryService.findOne(categoryId);
        // check category has key
        if (itemCategory.Key != null) {
            // not be update/delete its a default category
            throw new MessageException(`Default category can't be update or delete. id= ${categoryId}`);
        }
        // check listingItem realted with category id
        const listingItem = await this.listingItemService.findByCategory(categoryId);
        if (listingItem.toJSON().length > 0) {
            // not be update/delete its a related with listing-items
            throw new MessageException(`Category related with listing-items can't be update or delete. id= ${categoryId}`);
        }
        return true;
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
