import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemTemplateSearchParams } from '../../requests/ListingItemTemplateSearchParams';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ListingItemTemplateSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItemTemplate>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: profile id
     *  [4]: category, number|string, if string, try to search using key, can be null
     *  [5]: searchString, string, can be null
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return this.listingItemTemplateService.search({
            page: data.params[0] || 1,
            pageLimit: data.params[1] || 5,
            order: data.params[2] || 'ASC',
            profileId: data.params[3],
            category: data.params[4],
            searchString: data.params[5] || ''
        } as ListingItemTemplateSearchParams);
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <profileId> [<categoryName> [<searchString>]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - Numeric - The number page we want to view of search \n'
            + '                                listing item template results. \n'
            + '    <pageLimit>              - Numeric - The number of results per page. \n'
            + '    <order>                  - ENUM{ASC} - The order of the returned results. \n'
            + '    <profileId>              - Numeric - The ID of the profile linked to the listing item \n'
            + '                                templates we want to search for. \n'
            + '    <categoryName>           - [optional] String - The key identifying the category \n'
            + '                                associated with the listing item templates we want to \n'
            + '                                search for. \n'
            + '    <searchString>           - [optional] String - A string that is used to search for \n'
            + '                                listing item templats via title. ';
    }

    public description(): string {
        return 'Search listing items with pagination by category id or'
        + ' category name or by profileId, or by perticular searchString matched with itemInformation title.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1 10 ASC 1 74 \'pet exorcism\'';
    }
}
