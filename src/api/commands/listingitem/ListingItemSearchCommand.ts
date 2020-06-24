// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemSearchParams } from '../../requests/search/ListingItemSearchParams';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { Commands } from '../CommandEnumType';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { ListingItemSearchOrderField } from '../../enums/SearchOrderField';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { IdentityService } from '../../services/model/IdentityService';

export class ListingItemSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItem>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService
    ) {
        super(Commands.ITEM_SEARCH);
        this.log = new Logger(__filename);
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(ListingItemSearchOrderField) as string[];
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: market, string, the market receiveAddress
     *  [5]: categories, optional, number[]|string>[], if string -> find using key
     *  [6]: seller, optional, string, address
     *  [7]: minPrice, optional, number, listingItem basePrice minimum
     *  [8]: maxPrice, optional, number, listingItem basePrice maximum
     *  [9]: country, optional, string
     *  [10]: shippingDestination, optional, string
     *  [11]: searchString, optional, string
     *  [12]: flagged, optional, boolean
     *  [13]: listingItemHash, optional, string
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ListingItem>> {

        const searchParams = {
            page: data.params[0],
            pageLimit: data.params[1],
            order: data.params[2],
            orderField: data.params[3],
            market: data.params[4],
            categories: data.params[5],
            seller: data.params[6],
            minPrice: data.params[7],
            maxPrice: data.params[8],
            country: data.params[9],
            shippingDestination: data.params[10],
            searchString: data.params[11],
            flagged: data.params[12],
            listingItemHash: data.params[13],
            msgid: data.params[14]
        } as ListingItemSearchParams;

        return await this.listingItemService.search(searchParams);
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: market, string, the market receiveAddress
     *  [5]: categories, optional, number[]|string>[], if string -> find using key
     *  [6]: seller, optional, string, address
     *  [7]: minPrice, optional, number, listingItem basePrice minimum
     *  [8]: maxPrice, optional, number, listingItem basePrice maximum
     *  [9]: country, optional, string
     *  [10]: shippingDestination, optional, string
     *  [11]: searchString, optional, string
     *  [12]: flagged, optional, boolean
     *  [13]: listingItemHash, optional, string
     *  [14]: msgid, optional, string
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        if (data.params.length < 5) {
            throw new MissingParamException('market');
        }

        const market = data.params[4];                  // required
        const categories = data.params[5];              // optional
        const seller = data.params[6];                  // optional
        const minPrice = data.params[7];                // optional
        const maxPrice = data.params[8];                // optional
        const country = data.params[9];                 // optional
        const shippingDestination = data.params[10];    // optional
        const searchString = data.params[11];           // optional
        const flagged = data.params[12];                // optional
        const listingItemHash = data.params[13];        // optional

        // make sure the params are of correct type
        if (!_.isNil(market) && typeof market !== 'string') {
            throw new InvalidParamException('market', 'string');
        }

        if (!_.isNil(categories) && categories !== null) {
            // categories needs to be an array
            if (!_.isArray(categories)) {
                throw new InvalidParamException('categories', 'number[] | string[]');
            } else {
                // validate types, since we could have any[]...
                let foundDifferentTypes = _.find(categories, value => {
                    return typeof value !== typeof categories[0];
                });
                foundDifferentTypes = foundDifferentTypes !== undefined;
                if (foundDifferentTypes) {
                    throw new InvalidParamException('categories', 'number[] | string[]');
                }

                // don't need an empty category array
                data.params[5] = categories.length > 0 ? categories : undefined;
            }
        } else {
            //
        }

        // check valid profile profileId searchBy params
        if (!_.isNil(seller) && typeof seller !== 'string') {
            throw new InvalidParamException('seller', 'string');
        } else if (!_.isNil(minPrice) && typeof minPrice !== 'number') {
            throw new InvalidParamException('minPrice', 'number');
        } else if (!_.isNil(minPrice) && minPrice < 0) {
            throw new InvalidParamException('minPrice');
        } else if (!_.isNil(maxPrice) && typeof maxPrice !== 'number') {
            throw new InvalidParamException('maxPrice', 'number');
        } else if (!_.isNil(maxPrice) && maxPrice < 0) {
            throw new InvalidParamException('maxPrice');
        } else if (!_.isNil(country) && typeof country !== 'string') {
            throw new InvalidParamException('country', 'string');
        } else if (!_.isNil(shippingDestination) && typeof shippingDestination !== 'string') {
            throw new InvalidParamException('shippingDestination', 'string');
        } else if (!_.isNil(searchString) && typeof searchString !== 'string') {
            throw new InvalidParamException('searchString', 'string');
        } else if (!_.isNil(flagged) && !_.isBoolean(flagged)) {
            throw new InvalidParamException('flagged', 'boolean');
        } else if (!_.isNil(listingItemHash) && typeof listingItemHash !== 'string') {
            throw new InvalidParamException('listingItemHash', 'string');
        }

        if (_.isNil(seller) || seller === '*') {
            data.params[6] = undefined;
        }

        if (_.isNil(minPrice)) {
            data.params[7] = undefined;
        }
        if (_.isNil(maxPrice)) {
            data.params[8] = undefined;
        }

        data.params[9] = _.isNil(country)
            ? undefined
            : ShippingCountries.convertAndValidate(country + '');

        data.params[10] = _.isNil(shippingDestination)
            ? undefined
            : ShippingCountries.convertAndValidate(shippingDestination + '');

        if (_.isNil(searchString) || searchString === '*') {
            data.params[11] = undefined;
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <orderField> <market> [categories]' +
            ' [seller] [minPrice] [maxPrice] [country] [shippingDestination]' +
            ' [searchString] [flagged] [listingItemHash]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - Numeric - The number of the page we want to view. \n'
            + '    <pageLimit>              - Numeric - The number of results per page. \n'
            + '    <order>                  - ENUM{SearchOrder} - The order of the returned results. \n'
            + '    <orderField>             - ENUM{ListingItemSearchOrderField} - The field to use to sort results.\n'
            + '    <market>                 - String - Market receiveAddress. \n'
            + '    <categories>             - Array - ItemCategory Ids or keys. \n'
            + '    <seller>                 - [optional] String - Seller address. \n'
            + '    <minPrice>               - [optional] Numeric - The minimum price of the ListingItem. \n'
            + '    <maxPrice>               - [optional] Numeric - The maximum price of the ListingItem. \n'
            + '    <country>                - [optional] String - The country of the ListingItem. \n'
            + '    <shippingDestination>    - [optional] String - The shipping destination of the ListingItem. \n'
            + '    <searchString>           - [optional] String - ListingItems title. \n'
            + '    <flagged>                - [optional] Boolean - Flagged ListingItem (default: false). \n'
            + '    <listingItemHash>        - [optional] String - ListingItems hash. \n';
    }


    public description(): string {
        return 'Search ListingItems with pagination.';
    }

    public example(): string {
        return 'item ' + this.getName() + ' 1 10 ASC 76 1 100 200 Australia China wine';
    }

}
