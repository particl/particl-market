import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';

export class ItemCategoryGetCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'getcategory';
        this.helpStr = 'getcategory (<categoryId>|<categoryKey>)\n'
            + '    <categoryId>                    - Numeric - The ID belonging to the category we\n'
            + '                                       want to retrive.\n'
            + '    <categoryKey>                   - String - The key that identifies the category\n'
            + '                                       we want to retrieve.';
    }

    /**
     * data.params[]:
     *  [0]: id or key
     *
     * when data.params[0] is number then findById, else findOneByKey
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemCategory> {
        if (typeof data.params[0] === 'number') {
            return await this.itemCategoryService.findOne(data.params[0]);
        } else {
            return await this.itemCategoryService.findOneByKey(data.params[0]);
        }
    }

    public help(): string {
        return this.helpStr;
    }
}
