import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategoryService } from '../ItemCategoryService';

export class RpcItemCategoryService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
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
     * creates a new user defined category, these dont have a key and they always need to have a parentItemCategoryId
     *
     * data.params[]:
     *  [0]: category name
     *  [1]: description
     *  [2]: parentItemCategoryId
     *
     *  todo: parentItemCategoryId should not be null
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async create( @request(RpcRequest) data: any): Promise<ItemCategory> {
        return await this.itemCategoryService.create({
            name: data.params[0],
            description: data.params[1],
            parentItemCategoryId: data.params[2] || null
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
        return await this.itemCategoryService.update(data.params[0], {
            name: data.params[1],
            description: data.params[2],
            parentItemCategoryId: data.params[3] || null
        });
    }

    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        return await this.itemCategoryService.destroy(data.params[0]);
    }
}
