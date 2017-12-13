import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemCategory } from '../models/ItemCategory';
import {RpcCommand} from './RpcCommand';

export class ItemCategoryFindCommand implements RpcCommand<ItemCategory> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemcategory.find';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemCategory> {
        if (typeof data.params[0] === 'number') {
            return await this.itemCategoryService.findOne(data.params[0]);
        } else {
            return await this.itemCategoryService.findOneByKey(data.params[0]);
        }
    }

    public help(): string {
        return 'ItemCategoryFindCommand: TODO: Fill in help string.';
    }
}
