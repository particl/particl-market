import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ItemCategorySearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ItemCategory>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService
    ) {
        super(Commands.CATEGORY_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: searchString, string, can be null
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ItemCategory>> {
        return await this.itemCategoryService.findByName(data.params[0]);
    }

    public usage(): string {
        return this.getName() + ' [<searchString>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <searchString>                - [optional] String - A search string for finding \n'
            + '                                     categories by name. ';
    }

    public description(): string {
        return 'Command for getting an item categories search by particular search string';
    }

}
