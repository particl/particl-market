// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
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
import { MissingParamException } from '../../exceptions/MissingParamException';

export class ListingItemTemplateSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItemTemplate>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_SEARCH);
        this.log = new Logger(__filename);
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
     *  [4]: profileId, number, optional
     *  [5]: searchString, string, optional
     *  [6]: categories, optional, number[]|string>[], if string -> find using key
     *  [7]: hasItems, boolean, optional
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ListingItemTemplate>> {

        const searchParams = {
            page: data.params[0] || 0,
            pageLimit: data.params[1] || 10,
            order: data.params[2] || SearchOrder.ASC,
            orderField: data.params[3] || ListingItemTemplateSearchOrderField.UPDATED_AT,
            profileId: data.params[4],
            searchString: data.params[5],
            categories: data.params[6],
            hasListingItems: data.params[7]
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
     *  [6]: categories, optional, number[]|string>[], if string -> find using key
     *  [7]: hasItems, boolean, optional
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        if (data.params.length < 5) {
            throw new MissingParamException('profileId');
        }

        const profileId = data.params[4];       // required
        const searchString = data.params[5];    // optional
        const categories = data.params[6];      // optional
        const hasItems = data.params[7];        // optional

        if (profileId && typeof profileId !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (searchString && typeof searchString !== 'string') {
            throw new InvalidParamException('searchString', 'string');
        } else if (hasItems && typeof hasItems !== 'boolean') {
            throw new InvalidParamException('hasItems', 'boolean');
        }

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
            // don't need an empty category array
            data.params[5] = categories.length > 0 ? categories : undefined;
        }

        data.params[5] = searchString !== '*' ? data.params[5] : undefined;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <orderField> <profileId> [searchString] [categories] [hasItems] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - Numeric - The number of the page we want to view. \n'
            + '    <pageLimit>              - Numeric - The number of results per page. \n'
            + '    <order>                  - ENUM{SearchOrder} - The order of the returned results. \n'
            + '    <orderField>             - ENUM{ListingItemTemplateSearchOrderField} - The field to use to sort results.\n'
            + '    <profileId>              - Numeric - The ID of the profile linked to the listing item \n'
            + '                                templates we want to searchBy for. \n'
            + '    <searchString>           - [optional] String - A string that is used to searchBy for \n'
            + '                                listing item templats via title. \n'
            + '    <categories>             - [optional] Array - ItemCategory Ids or keys. \n'
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
