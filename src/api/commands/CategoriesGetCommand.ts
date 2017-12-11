import * as Bookshelf from 'bookshelf';
import { injectable, inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemCategory } from '../models/ItemCategory';
import {RpcCommand} from './RpcCommand';

// @injectable
export class CategoriesGetCommand implements RpcCommand<ItemCategory> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'getcategories';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemCategory> {
        return await this.itemCategoryService.findRoot();
    }

    public help(): string {
        return 'GetCategoriesCommand: TODO: Fill in help string.';
    }
}
