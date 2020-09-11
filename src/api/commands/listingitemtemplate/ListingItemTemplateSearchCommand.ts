// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { ListingItemTemplateSearchOrderField } from '../../enums/SearchOrderField';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemTemplateSearchParams } from '../../requests/search/ListingItemTemplateSearchParams';
import { Commands } from '../CommandEnumType';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SearchOrder } from '../../enums/SearchOrder';
import { ProfileService } from '../../services/model/ProfileService';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MarketService } from '../../services/model/MarketService';
import { CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';


export class ListingItemTemplateSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItemTemplate>> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_SEARCH);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [{
                name: 'profileId',
                required: true,
                type: 'number'
            }, {
                name: 'searchString',
                required: false,
                type: 'string'
            }, {
                name: 'categories',
                required: false,
                type: undefined // todo: number[]|string[]'
            }, {
                name: 'isBaseTemplate',
                required: false,
                type: 'boolean'
            }, {
                name: 'marketReceiveAddress',
                required: false,
                type: 'string'
            }, {
                name: 'hasItems',
                required: false,
                type: 'boolean'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(ListingItemTemplateSearchOrderField) as string[];
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: profile, resources.Profile, optional
     *  [5]: searchString, string, optional
     *  [6]: categories, optional, number[]|string[], if string -> find using key
     *  [7]: isBaseTemplate, boolean, optional, default true
     *  [8]: market, resources.Market, optional
     *  [9]: hasItems, boolean, optional
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ListingItemTemplate>> {

        const profile: resources.Profile = data.params[4];
        const market: resources.Market = data.params[8];

        const searchParams = {
            page: data.params[0] || 0,
            pageLimit: data.params[1] || 10,
            order: data.params[2] || SearchOrder.ASC,
            orderField: data.params[3] || ListingItemTemplateSearchOrderField.UPDATED_AT,
            profileId: profile ? profile.id : undefined,
            searchString: data.params[5],
            categories: data.params[6],
            isBaseTemplate: data.params[7],
            marketReceiveAddress: market ? market.receiveAddress : undefined,
            hasListingItems: data.params[9]
        } as ListingItemTemplateSearchParams;

        return await this.listingItemTemplateService.search(searchParams);
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: profileId, number, required
     *  [5]: searchString, string, * for all, optional
     *  [6]: categories, optional, number[]|string[], if string -> find using key
     *  [7]: isBaseTemplate, boolean, optional, default true
     *  [8]: marketReceiveAddress, string, * for all, optional
     *  [9]: hasItems, boolean, optional
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const profileId = data.params[4];               // required
        const searchString = data.params[5];            // optional
        const categories = data.params[6];              // optional
        const isBaseTemplate = data.params[7];          // optional
        let marketReceiveAddress = data.params[8];    // optional
        const hasItems = data.params[9];                // optional

        // make sure Profile with the id exists
        const profile: resources.Profile = await this.profileService.findOne(profileId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        if (categories) {
            // categories needs to be an array
            if (!_.isArray(categories)) {
                throw new InvalidParamException('categories', 'number[] | string[]');
            } else {
                // validate types, since we could have any[]...
                const foundDiffenent = _.find(categories, value => {
                    return typeof value !== typeof categories[0];
                });
                if (foundDiffenent) {
                    throw new InvalidParamException('categories', 'number[] | string[]');
                }
            }
        }

        marketReceiveAddress = (marketReceiveAddress !== '*') ? marketReceiveAddress : undefined;
        if (marketReceiveAddress) {
            const market: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(profileId, marketReceiveAddress)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Market');
                });
            data.params[8] = market;
        }

        data.params[4] = profile;
        data.params[5] = searchString !== '*' ? searchString : undefined;
        data.params[6] = (categories && categories.length) > 0 ? categories : undefined;
        // data.params[7] = !_.isNil(isBaseTemplate) ? isBaseTemplate : false;
        data.params[8] = marketReceiveAddress;
        // data.params[9] = !_.isNil(hasItems) ? hasItems : false;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <orderField> <profileId> [searchString] [categories] [isBaseTemplate] [market] [hasItems] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - Numeric - The number of the page we want to view. \n'
            + '    <pageLimit>              - Numeric - The number of results per page. \n'
            + '    <order>                  - ENUM{SearchOrder} - The order of the returned results. \n'
            + '    <orderField>             - ENUM{ListingItemTemplateSearchOrderField} - The field to use to sort results.\n'
            + '    <profileId>              - Numeric - The ID of the profile linked to the ListingItemTemplates we want to searchBy for. \n'
            + '    <searchString>           - [optional] String - A string that is used to searchBy for \n'
            + '                                ListingItemTemplates via title. \n'
            + '    <categories>             - [optional] Array - ItemCategory Ids or keys. \n'
            + '    <isBaseTemplate>         - [optional] Boolean - if true then return only base ListingItemTemplates. \n'
            + '    <market>                 - [optional] String - filter market ListingItemTemplates by the market\n'
            + '    <hasItems>               - [optional] Boolean - if true then filter ListingItemTemplates \n'
            + '                                by having or not having ListingItems. \n';
    }

    public description(): string {
        return 'Search ListingItemTemplates.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 0 10 \'ASC\' \'STATE\' 1 \'pet exorcism\' 74 true';
    }
}
