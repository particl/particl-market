// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemSearchParams } from '../../requests/ListingItemSearchParams';
import { ListingItemSearchType } from '../../enums/ListingItemSearchType';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ListingItemSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItem>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.ITEM_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: category, number|string, if string, try to find using key, can be null
     *  [4]: type (FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL)
     *  [5]: profileId, (NUMBER | OWN | ALL | *)
     *  [6]: minPrice, number to searchBy item basePrice between 2 range
     *  [7]: maxPrice, number to searchBy item basePrice between 2 range
     *  [8]: country, string, can be null
     *  [9]: shippingDestination, string, can be null
     *  [10]: searchString, string, can be null
     *  [11]: flagged, boolean, can be null
     *  [12]: withRelated, boolean
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ListingItem>> {
        const type = data.params[4] || 'ALL';
        const profileId = data.params[5] || 'ALL';

        // check valid searchBy type
        if (!ListingItemSearchType[type]) {
            throw new MessageException('Type should be FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL');
        }

        // check valid profile profileId searchBy params
        if (typeof profileId !== 'number' && profileId !== 'OWN' && profileId !== 'ALL' && profileId !== '*') {
            throw new MessageException('Value needs to be number | OWN | ALL. you could pass * as all too');
        }

        let countryCode: string | null = null;
        if (data.params[8]) {
            countryCode = ShippingCountries.convertAndValidate(data.params[8]);
        }

        let shippingCountryCode: string | null = null;
        if (data.params[9]) {
            shippingCountryCode = ShippingCountries.convertAndValidate(data.params[9]);
        }

        return await this.listingItemService.search({
            page: data.params[0] || 0,
            pageLimit: data.params[1] || 10, // default page limit 10
            order: data.params[2] || 'ASC',
            category: data.params[3],
            profileId,
            minPrice: data.params[6],
            maxPrice: data.params[7],
            country: countryCode,
            shippingDestination: shippingCountryCode,
            searchString: data.params[10] || '',
            flagged: data.params[11]
        } as ListingItemSearchParams, data.params[12]);
    }

    // tslint:disable:max-line-length
    public usage(): string {
        return this.getName() + ' [<page> [<pageLimit> [<ordering> ' +
        '[(<categoryId> | <categoryName>)[ <type> [(<profileId>| OWN | ALL) [<minPrice> [ <maxPrice> [ <country> [ <shippingDestination> [<searchString> [<flagged> ]]]]]]]]]]]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - [optional] Numeric - The number page we want to \n'
            + '                                view of searchBy listing item results. \n'
            + '    <pageLimit>              - [optional] Numeric - The number of results per page. \n'
            + '    <ordering>               - [optional] ENUM{ASC,DESC} - The ordering of the searchBy results. \n'
            + '    <categoryId>             - [optional] Numeric - The ID identifying the category associated \n'
            + '                                with the listing items we want to searchBy for. \n'
            + '    <categoryName>           - [optional] String - The key identifying the category associated \n'
            + '                                with the listing items we want to searchBy for. \n'
            + '    <type>                  -  ENUM{FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL} \n'
            + '                                 FLAGGED = ListingItems you have flagged \n'
            + '                                 PENDING = ListingItemTemplates posted to marketplace\n'
            + '                                           but not yet received as ListingItem \n'
            + '                                 IN_ESCROW = ListingItems that are escrow \n'
            + '                                 SHIPPED = ListingItems that have been shipped \n'
            + '                                 SOLD = ListingItems that have been sold \n'
            + '                                 EXPIRED = ListingItems that have been expired \n'
            + '                                 ALL = all items\n'
            + '    <profileId>             -  (NUMBER | OWN | ALL | *) \n'
            + '                                 NUMBER - ListingItems belonging to profileId \n'
            + '                                 OWN - ListingItems belonging to any profile \n'
            + '                                 ALL / * - ALL ListingItems\n'
            + '    <minPrice>               - [optional] Numeric - The minimum price of the listing item price \n'
            + '                                we want to searchBy for between basePrice range. \n'
            + '    <maxPrice>               - [optional] Numeric - The maximum price of the listing item price \n'
            + '                                we want to searchBy for between basePrice range. \n'
            + '    <country>                - [optional] String - The country of the listing item \n'
            + '                                we want to searchBy for. \n'
            + '    <shippingDestination>    - [optional] String - The shipping destination of the listing item \n'
            + '                                we want to searchBy for. \n'
            + '    <searchString>           - [optional] String - A string that is used to \n'
            + '                                find listing items by their titles. \n'
            + '    <flagged>                - [optional] Boolean - Search for flagged or non-flagged \n'
            + '                                listing items (default: true). \n'
            + '    <withRelated>            - [optional] Boolean - Whether to include related data or not (default: true). ';
    }

    // tslint:enable:max-line-length

    public description(): string {
        return 'Search listing items with pagination by category id or'
            + ' category name or by profileId, or by listing item price'
            + ' min and max price range, or by country or shipping destination.';
    }

    public example(): string {
        return 'item ' + this.getName() + ' 1 10 ASC 76 1 100 200 Australia China wine';
    }

}
