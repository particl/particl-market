import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategoryUpdateRequest } from '../../requests/ItemCategoryUpdateRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';

export class ItemCategoryUpdateCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'updatecategory';
        this.helpStr = 'updatecategory <categoryId> <categoryName> <description> [<parentItemCategoryId>]\n'
            + '    <categoryId>                     - Numeric - The ID of the category we want to\n'
            + '                                        update.\n'
            + '    <categoryName>                   - String - The new name of the category we want\n'
            + '                                        to update.\n'
            + '    <description>                    - String - The new description of the category\n'
            + '                                        we want to update.\n'
            + '    <parentItemCategoryId>           - [optional] Numeric - The ID that identifies the\n'
            + '                                        new parent category of the category we want to\n'
            + '                                        update; default is the root category.';
    }

    /**
     * updates user defined category
     *
     * data.params[]:
     *  [0]: category id
     *  [1]: category name
     *  [2]: description
     *  [3]: parentItemCategoryId
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemCategory> {
        const isUpdateable = await this.isDoable(data.params[0]);
        if (isUpdateable) {
            const parentItemCategory = data.params[3] || 'cat_ROOT'; // if null then default_category will be parent
            const parentItemCategoryId = await this.getCategoryIdByKey(parentItemCategory);
            return await this.itemCategoryService.update(data.params[0], {
                name: data.params[1],
                description: data.params[2],
                parent_item_category_id: parentItemCategoryId
            } as ItemCategoryUpdateRequest);
        } else {
            throw new MessageException(`category can't be update. id= ${data.params[0]}`);
        }
    }

    public help(): string {
        return this.helpStr;
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
