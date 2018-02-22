import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategoryCreateRequest } from '../../requests/ItemCategoryCreateRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ItemCategoryAddCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService
    ) {
        super(Commands.CATEGORY_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * creates a new user defined category, these don't have a key and they always need to have a parent_item_category_id
     *
     * data.params[]:
     *  [0]: category name
     *  [1]: description
     *  [2]: parent_item_category_id id/key
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {
        if (data.params[2]) {
            const parentItemCategory = data.params[2];
            const parentItemCategoryId = await this.getCategoryIdByKey(parentItemCategory);
            return await this.itemCategoryService.create({
                name: data.params[0],
                description: data.params[1],
                parent_item_category_id: parentItemCategoryId
            } as ItemCategoryCreateRequest);
        } else {
            throw new MessageException(`Parent category can't be null or undefined!`);
        }
    }

    public usage(): string {
        return this.getName() + ' <categoryName> <description> (<parentItemCategoryId>|<parentItemCategoryKey>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryName>                - String - The name of the category to create. \n'
            + '    <description>                 - String - A description of the category to \n'
            + '                                     create. \n'
            + '    <parentItemCategoryId>        - Numeric - The ID of the parent category of the \n'
            + '                                     category we\'re creating. \n'
            + '    <parentItemCategoryKey>       - String - The identifying key of the parent \n'
            + '                                     category of the category we\'re creating. ';
    }

    public description(): string {
        return 'Command for adding an item category.';
    }

    public example(): string {
        return 'category ' + this.getName() + ' newCategory \'description of the new category\' cat_wholesale_other ';
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
