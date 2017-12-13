import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { ListingItemService } from '../../services/ListingItemService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommand } from '../RpcCommand';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplateSearchParams } from '../../requests/ListingItemTemplateSearchParams';

export class ItemCategoryRemoveCommand implements RpcCommand<void> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'removecategory';
    }

    /**
     * remove user defined category
     * data.params[]:
     *  [0]: category id
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        const categoryId = data.params[0];
        const isDelete = await this.isDoable(categoryId);
        if (isDelete) {
            // check listingItemTemplate related with category
            const listingItemTemplates = await this.listingItemTemplateService.search({
                page: 1, pageLimit: 10, order: 'ASC', category: categoryId, profileId: 0
            } as ListingItemTemplateSearchParams);
            if (listingItemTemplates.toJSON().length > 0) {
                // not be delete its a associated with listingItemTemplate
                throw new MessageException(`Category associated with listing-item-template can't be delete. id= ${categoryId}`);
            }
            return await this.itemCategoryService.destroy(categoryId);
        } else {
            throw new MessageException(`category can't be delete. id= ${categoryId}`);
        }
    }

    public help(): string {
        return 'ItemCategoryRemoveCommand: TODO: Fill in help string.';
    }

    /**
     * function to check category is default, check category is not associated with listing-item
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
}
