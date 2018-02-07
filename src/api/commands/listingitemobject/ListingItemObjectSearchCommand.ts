import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemObjectService } from '../../services/ListingItemObjectService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemObject } from '../../models/ListingItemObject';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemObjectSearchParams } from '../../requests/ListingItemObjectSearchParams';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ListingItemObjectSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItemObject>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemObjectService) public listingItemObjectService: ListingItemObjectService
    ) {
        super(Commands.ITEMOBJECT_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: searchString, string
     *
     * @param data
     * @returns {Promise<ListingItemObject>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.listingItemObjectService.search({
            searchString: data.params[0]
        } as ListingItemObjectSearchParams);
    }

    public help(): string {
        return this.getName() + ' <searchString>\n'
            + '               <searchString>        -String - A string that is used to\n'
            + '                                       find listing items object by matching their type or description.';
    }

    public description(): string {
        return 'Search listing items objects by given string match with listing item object type or description';
    }

}
