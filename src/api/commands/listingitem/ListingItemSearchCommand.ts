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
import { IdentityService } from '../../services/model/IdentityService';
import { CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';


export class ListingItemSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItem>> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService
    ) {
        super(Commands.ITEM_SEARCH);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [{
                name: 'market',
                required: true,
                type: 'string'
            }, {
                name: 'categories',
                required: false,
                type: undefined     // todo: number[]|string>[]
            }, {
                name: 'seller',
                required: false,
                type: 'string'
            }, {
                name: 'minPrice',
                required: false,
                type: 'number',
                customValidate: (value, index, allValues) => {
                    if (!_.isNil(value)) {
                        const maxPrice = allValues[index + 1];
                        // if set, must be >= 0
                        // if maxPrice set, must be < maxPrice
                        const largerThanZero = !_.isNil(value) ? value >= 0 : true;
                        const smallerThanMaxPrice = !_.isNil(maxPrice) ? value < maxPrice : true;
                        this.log.debug('largerThanZero: ' + largerThanZero + ', smallerThanMaxPrice: ' + smallerThanMaxPrice);
                        return largerThanZero && smallerThanMaxPrice;
                    }
                    return true;
                }
            }, {
                name: 'maxPrice',
                required: false,
                type: 'number',
                customValidate: (value, index, allValues) => {
                    if (!_.isNil(value)) {
                        const minPrice = allValues[index - 1];
                        // if set, must be >= 0
                        // if minPrice set, must be > minPrice
                        const largerThanZero = !_.isNil(value) ? value >= 0 : true;
                        const largerThanMinPrice = !_.isNil(minPrice) ? value > minPrice : true;
                        this.log.debug('largerThanZero: ' + largerThanZero + ', largerThanMinPrice: ' + largerThanMinPrice);
                        return largerThanZero && largerThanMinPrice;
                    }
                    return true;
                }
            }, {
                name: 'country',
                required: false,
                type: 'string'
            }, {
                name: 'shippingDestination',
                required: false,
                type: 'string'
            }, {
                name: 'searchString',
                required: false,
                type: 'string'
            }, {
                name: 'flagged',
                required: false,
                type: 'boolean'
            }, {
                name: 'listingItemHash',
                required: false,
                type: 'string'
            }, {
                name: 'msgid',
                required: false,
                type: 'string'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
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
     *  [14]: msgid, optional, string
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
        const msgid = data.params[14];                  // optional

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
        }

        data.params[6] = _.isNil(seller) || seller === '*' ? undefined : seller;
        data.params[7] = _.isNil(minPrice) ? undefined : minPrice;
        data.params[8] = _.isNil(maxPrice) ? undefined : maxPrice;
        data.params[9] = _.isNil(country) ? undefined : ShippingCountries.convertAndValidate(country + '');
        data.params[10] = _.isNil(shippingDestination) ? undefined : ShippingCountries.convertAndValidate(shippingDestination + '');
        data.params[11] = _.isNil(searchString) || searchString === '*' ? undefined : searchString;
        data.params[12] = _.isNil(flagged) ? undefined : flagged;
        data.params[13] = _.isNil(listingItemHash) || listingItemHash === '*' ? undefined : listingItemHash;
        data.params[14] = _.isNil(msgid) || msgid === '*' ? undefined : msgid;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <orderField> <market> [categories]' +
            ' [seller] [minPrice] [maxPrice] [country] [shippingDestination]' +
            ' [searchString] [flagged] [listingItemHash] [msgid]';
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
            + '    <shippingDestination>    - [optional] String - The ShippingDestination of the ListingItem. \n'
            + '    <searchString>           - [optional] String - ListingItem title. \n'
            + '    <flagged>                - [optional] Boolean - Flagged ListingItems (default: false). \n'
            + '    <listingItemHash>        - [optional] String - ListingItem hash. \n'
            + '    <msgid>                  - [optional] String - ListingItem msgid. \n';
    }


    public description(): string {
        return 'Search ListingItems with pagination.';
    }

    public example(): string {
        return 'item ' + this.getName() + ' 1 10 ASC 76 1 100 200 Australia China wine';
    }

}
