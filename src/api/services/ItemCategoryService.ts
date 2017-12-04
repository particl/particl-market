import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemCategoryRepository } from '../repositories/ItemCategoryRepository';
import { ItemCategory } from '../models/ItemCategory';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import { ItemCategoryUpdateRequest } from '../requests/ItemCategoryUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class ItemCategoryService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemCategoryRepository) public itemCategoryRepo: ItemCategoryRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemCategory>> {
        return this.itemCategoryRepo.findAll();
    }

    public async findOneByKey(key: string, withRelated: boolean = true): Promise<ItemCategory> {
        const itemCategory = await this.itemCategoryRepo.findOneByKey(key, withRelated);
        return itemCategory;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemCategory> {
        const itemCategory = await this.itemCategoryRepo.findOne(id, withRelated);
        if (itemCategory === null) {
            this.log.warn(`ItemCategory with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemCategory;
    }

    public async findRoot(): Promise<ItemCategory> {
        return await this.itemCategoryRepo.findRoot();
    }

    public async findByName(name: string, withRelated: boolean = true): Promise<Bookshelf.Collection<ItemCategory>> {
        return await this.itemCategoryRepo.findByName(name, withRelated);
    }

    @validate()
    public async create( @request(ItemCategoryCreateRequest) body: any): Promise<ItemCategory> {

        if (body.parent_item_category_id === 0) {
            delete body.parent_item_category_id;
        }
        // If the request body was valid we will create the itemCategory
        const itemCategory = await this.itemCategoryRepo.create(body);

        // finally find and return the created itemCategory
        const newItemCategory = await this.findOne(itemCategory.Id);
        return newItemCategory;
    }

    @validate()
    public async update(id: number, @request(ItemCategoryUpdateRequest) body: any, patching: boolean = true): Promise<ItemCategory> {

        // parent_item_category_id

        // find the existing one without related
        const itemCategory = await this.findOne(id, false);

        // set new values
        itemCategory.Name = body.name;
        itemCategory.Description = body.description;

        // need to set this to null, otherwise it won't get updated
        // itemCategory.parent_item_category_id = body.parentItemCategoryId === undefined ? null : body.parent_item_category_id;

        // update itemCategory record
        const updatedItemCategory = await this.itemCategoryRepo.update(id, itemCategory.toJSON(), patching);
        return updatedItemCategory;
    }

    public async destroy(id: number): Promise<void> {
        await this.itemCategoryRepo.destroy(id);
    }
}
