// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { SearchOrderField } from '../../enums/SearchOrderField';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemTemplateSearchParams } from '../../requests/ListingItemTemplateSearchParams';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

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
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied NEW
     *  [4]: profile id
     *  [5]: searchString, string, optional
     *  [6]: category, number|string, if string, try to search using key, optional
     *  [7]: hasItems, boolean, optional NEW
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return await this.listingItemTemplateService.search({
            page: data.params[0] || 0,
            pageLimit: data.params[1] || 10,
            order: data.params[2] || 'ASC',
            orderField: data.params[3] || SearchOrderField.DATE,
            profileId: data.params[4],
            searchString: data.params[5] || '',
            category: data.params[6],
            hasItems: data.params[7]
        } as ListingItemTemplateSearchParams);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 5) {
            throw new MessageException('Missing parameters.');
        }
        const field = data.params[3];
        const validFields = [SearchOrderField.STATE, SearchOrderField.DATE, SearchOrderField.TITLE];
        if (field && !_.includes(validFields, field)) {
            throw new InvalidParamException('orderField');
        }
        // TODO:
        // - is order valid?
        // - profile exists?
        // - category exists?
        return data;
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <orderField> <profileId>[<searchString> [<category> [<hasItems> ]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - Numeric - The number page we want to view of search \n'
            + '                                listing item template results. \n'
            + '    <pageLimit>              - Numeric - The number of results per page. \n'
            + '    <order>                  - ENUM{ASC} - The order of the returned results. \n'
            + '    <orderField>             - ENUM{STATE, TITLE, DATE} - The order field \n'
            + '                                by which make sorting of templates. \n'
            + '    <profileId>              - Numeric - The ID of the profile linked to the listing item \n'
            + '                                templates we want to search for. \n'
            + '    <searchString>           - [optional] String - A string that is used to search for \n'
            + '                                listing item templats via title. \n'
            + '    <category>               - [optional] String - The key identifying the category \n'
            + '                                associated with the listing item templates we want to \n'
            + '                                search for. \n'
            + '    <hasItems>               - [optional] Boolean - if true then filter ListingItemTemplates \n'
            + '                                by having or not having ListingItems. \n';
    }

    public description(): string {
        return 'Search listing items with pagination, state (published/non-published) by category id or'
        + ' category name or by profileId, or by perticular searchString matched with itemInformation title.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1 10 ASC STATE 1 \'pet exorcism\' 74 true';
    }
}
