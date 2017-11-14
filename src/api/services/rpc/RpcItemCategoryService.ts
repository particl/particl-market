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
        return this.itemCategoryService.findAll();
    }

    @validate()
    public async findOneByKey( @request(RpcRequest) data: any): Promise<ItemCategory> {
        return this.itemCategoryService.findOneByKey(data.params[0]);
    }

    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<ItemCategory> {
        return this.itemCategoryService.findOne(data.params[0]);
    }

    @validate()
    public async findRoot( @request(RpcRequest) data: any): Promise<ItemCategory> {
        return this.itemCategoryService.findRoot();
    }

    @validate()
    public async create( @request(RpcRequest) data: any): Promise<ItemCategory> {
        return this.itemCategoryService.create({
            name: data.params[0],
            description: data.params[1],
            parentItemCategoryId: data.params[2] || null
        });
    }

    @validate()
    public async update( @request(RpcRequest) data: any): Promise<ItemCategory> {
        return this.itemCategoryService.update(data.params[0], {
            name: data.params[1],
            description: data.params[2],
            parentItemCategoryId: data.params[3] || null
        });
    }

    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        return this.itemCategoryService.destroy(data.params[0]);
    }
}
