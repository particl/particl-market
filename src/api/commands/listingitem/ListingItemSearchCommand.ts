import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemSearchParams } from '../../requests/ListingItemSearchParams';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ListingItemSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItem>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.ITEM_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: category, number|string, if string, try to find using key, can be null
     *  [4]: profileId, number
     *  [5]: minPrice, number to search item basePrice between 2 range
     *  [6]: maxPrice, number to search item basePrice between 2 range
     *  [7]: country, string, can be null
     *  [8]: shippingDestination, string, can be null
     *  [9]: searchString, string, can be null
     *  [10]: withRelated, boolean
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ListingItem>> {
        return this.listingItemService.search({
            page: data.params[0] || 1,
            pageLimit: data.params[1] || 5, // default page limit 5
            order: data.params[2] || 'ASC',
            category: data.params[3],
            profileId: data.params[4],
            minPrice: data.params[5],
            maxPrice: data.params[6],
            country: data.params[7],
            shippingDestination: data.params[8],
            searchString: data.params[9] || ''
        } as ListingItemSearchParams, data.params[10]);
    }

    public usage(): string {
        return this.getName() + ' [<page> [<pageLimit> [<order> [(<categoryId>|<categoryName>) [(<profileId>|<ALL>) '
            + '[<minPrice> [ <maxPrice> [ <country> [ <shippingDestination> [<searchString>]]]]]]]]] \n';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - [optional] Numeric - The number page we want to \n'
            + '                                view of search listing item results. \n'
            + '    <pageLimit>              - [optional] Numeric - The number of results per page. \n'
            + '    <order>                  - [optional] ENUM{ASC} - The order of the returned results. \n'
            + '    <categoryId>             - [optional] Numeric - The ID identifying the category associated \n'
            + '                                with the listing items we want to search for. \n'
            + '    <categoryName>           - [optional] String - The key identifying the category associated \n'
            + '                                with the listing items we want to search for. \n'
            + '    <profileId>              - [optional] Numeric - The ID identifying the \n'
            + '    <minPrice>               - [optional] Numeric - The minimum price of the listing item price \n'
            + '                                we want to search for between basePrice range. \n'
            + '    <maxPrice>               - [optional] Numeric - The maximum price of the listing item price \n'
            + '                                we want to search for between basePrice range. \n'
            + '    <country>                - [optional] String - The country of the listing item \n'
            + '                                we want to search for. \n'
            + '    <shippingDestination>    - [optional] String - The shipping destination of the listing item \n'
            + '                                we want to search for. \n'
            + '    ALL                      - [optional] [TODO: REWRITE] any string or * or none \n'
            + '                                means dont want to search with profile \n'
            + '                                we want to search for. \n'
            + '    <searchString>           - [optional] String - A string that is used to \n'
            + '                                find listing items by their titles. ';
    }

    public description(): string {
        return 'Search listing items with pagination by category id or'
        + ' category name or by profileId, or by listing item price'
        + ' min and max price range, or by country or shipping destination.';
    }

    public example(): string {
        return 'item ' + this.getName() + ' 1 10 ASC 76 1 100 200 Australia China wine';
    }
}
