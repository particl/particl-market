import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategoryService } from '../ItemCategoryService';
import { ListingItemTemplateService } from '../ListingItemTemplateService';
import { ListingItemService } from '../ListingItemService';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplateSearchParams } from '../../requests/ListingItemTemplateSearchParams';

export class RpcItemCategoryService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async findAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemCategory>> {
        return await this.itemCategoryService.findAll();
    }

    /**
     * data.params[]:
     *  [0]: id or key
     *
     * when data.params[0] is number then findById, else findOneByKey
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<ItemCategory> {
        if (typeof data.params[0] === 'number') {
            return await this.itemCategoryService.findOne(data.params[0]);
        } else {
            return await this.itemCategoryService.findOneByKey(data.params[0]);
        }
    }

    /**
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async findRoot( @request(RpcRequest) data: any): Promise<ItemCategory> {
        return await this.itemCategoryService.findRoot();
    }

    /**
     * creates a new user defined category, these dont have a key and they always need to have a parent_item_category_id
     *
     * data.params[]:
     *  [0]: category name
     *  [1]: description
     *  [2]: parent_item_category_id id/key, default: cat_ROOT
     *
     *  todo: parent_item_category_id should not be null
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async create( @request(RpcRequest) data: any): Promise<ItemCategory> {
        const parentItemCategory = data.params[2] || 'cat_ROOT'; // if null then default_category will be parent
        const parentItemCategoryId = await this.getCategoryId(parentItemCategory);
        return await this.itemCategoryService.create({
            name: data.params[0],
            description: data.params[1],
            parent_item_category_id: parentItemCategoryId
        });
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
     * @returns {Promise<Profile>}
     */
    @validate()
    public async update( @request(RpcRequest) data: any): Promise<ItemCategory> {
        const isUpdateable = await this.isDoable(data.params[0]);
        if (isUpdateable) {
            const parentItemCategory = data.params[3] || 'cat_ROOT'; // if null then default_category will be parent
            const parentItemCategoryId = await this.getCategoryId(parentItemCategory);
            return await this.itemCategoryService.update(data.params[0], {
                name: data.params[1],
                description: data.params[2],
                parent_item_category_id: parentItemCategoryId
            });
        } else {
            throw new MessageException(`category can't be update. id= ${data.params[0]}`);
        }
    }

    /**
     * remove user defined category
     *
     * data.params[]:
     *  [0]: category id
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
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

    /**
     * function to return category id
     *
     * @param data
     * @returns {Promise<number>}
     */
    private async getCategoryId(parentItemCategory: any): Promise<number> {
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
