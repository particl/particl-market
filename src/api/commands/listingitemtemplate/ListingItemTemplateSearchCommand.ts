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
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { SearchOrderField } from '../../enums/SearchOrderField';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemTemplateSearchParams } from '../../requests/search/ListingItemTemplateSearchParams';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SearchOrder } from '../../enums/SearchOrder';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { ProfileService } from '../../services/model/ProfileService';

export class ListingItemTemplateSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItemTemplate>> {

    public log: LoggerType;
    private DEFAULT_PAGE_LIMIT = 10;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: profile id, number, optional
     *  [5]: searchString, string, optional
     *  [6]: category, number|string, if string, try to searchBy using key, optional
     *  [7]: hasItems, boolean, optional
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
            searchString: data.params[5],
            category: data.params[6],
            hasItems: data.params[7]
        } as ListingItemTemplateSearchParams);
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: profileId, number, optional
     *  [5]: searchString, string, * for all, optional
     *  [6]: category, number|string, if string, try to searchBy using key, * for all, optional
     *  [7]: hasItems, boolean, optional
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('page');
        } else if (data.params.length < 2) {
            throw new MissingParamException('pageLimit');
        } else if (data.params.length < 3) {
            throw new MissingParamException('order');
        } else if (data.params.length < 4) {
            throw new MissingParamException('orderField');
        }

        data.params[0] = data.params[0] ? data.params[0] : 0;
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('page');
        }

        data.params[1] = data.params[1] ? data.params[1] : this.DEFAULT_PAGE_LIMIT;
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('pageLimit');
        }

        if (data.params[2] === 'ASC') {
            data.params[2] = SearchOrder.ASC;
        } else {
            data.params[2] = SearchOrder.DESC;
        }
        const validSearchOrders = [SearchOrder.ASC, SearchOrder.DESC];
        if (!data.params[2] || !_.includes(validSearchOrders, data.params[2])) {
            throw new InvalidParamException('order');
        }

        const validOrderFields = [SearchOrderField.STATE, SearchOrderField.DATE, SearchOrderField.TITLE];
        if (!data.params[3] || !_.includes(validOrderFields, data.params[3])) {
            throw new InvalidParamException('orderField');
        }

        if (data.params[4] && typeof data.params[4] !== 'number') {
            throw new InvalidParamException('profileId');
        }

        data.params[5] = data.params[5] !== '*' ? data.params[5] : undefined;
        data.params[6] = data.params[6] !== '*' ? data.params[6] : undefined;

        // if (!data.params[7] || typeof data.params[7] !== 'boolean') {
        //   throw new InvalidParamException('hasItems');
        // }

        // TODO:
        // - category exists?

        return data;
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <orderField> <profileId>[<searchString> [<category> [<hasItems> ]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - Numeric - The number page we want to view of searchBy \n'
            + '                                listing item template results. \n'
            + '    <pageLimit>              - Numeric - The number of results per page. \n'
            + '    <order>                  - ENUM{ASC} - The order of the returned results. \n'
            + '    <orderField>             - ENUM{STATE, TITLE, DATE} - The order field \n'
            + '                                by which make sorting of templates. \n'
            + '    <profileId>              - Numeric - The ID of the profile linked to the listing item \n'
            + '                                templates we want to searchBy for. \n'
            + '    <searchString>           - [optional] String - A string that is used to searchBy for \n'
            + '                                listing item templats via title. \n'
            + '    <category>               - [optional] String - The key identifying the category \n'
            + '                                associated with the listing item templates we want to \n'
            + '                                searchBy for. \n'
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
