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
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { MarketSearchOrderField, SearchOrderField } from '../../enums/SearchOrderField';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { ProfileService } from '../../services/model/ProfileService';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { MarketService } from '../../services/model/MarketService';
import { MarketType } from '../../enums/MarketType';
import { MarketSearchParams } from '../../requests/search/MarketSearchParams';
import { Market } from '../../models/Market';
import { MarketRegion } from '../../enums/MarketRegion';
import { SearchOrder } from '../../enums/SearchOrder';
import { CommandParamValidationRules, EnumValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';


export class MarketSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<Market>> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.MARKET_SEARCH);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new StringValidationRule('searchString', false),
                new EnumValidationRule('type', false, 'MarketType',
                    EnumHelper.getValues(MarketType) as string[]),
                new EnumValidationRule('region', false, 'MarketRegion',
                    EnumHelper.getValues(MarketRegion) as string[])
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(MarketSearchOrderField) as string[];
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: searchString, string, optional, * for all
     *  [5]: type, MarketType, optional
     *  [6]: region, MarketRegion, optional
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Market>> {

        const page: number = data.params[0];
        const pageLimit: number = data.params[1];
        const order: SearchOrder = data.params[2];
        const orderField: SearchOrderField = data.params[3];
        const searchString: string = data.params[4];
        const type: MarketType = data.params[5];
        const region: MarketRegion = data.params[6];

        const searchParams = {
            page,
            pageLimit,
            order,
            orderField,
            searchString,
            type,
            region: region as string
        } as MarketSearchParams;

        return await this.marketService.search(searchParams);
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: searchString, string, optional, * for all
     *  [5]: type, MarketType, optional
     *  [6]: region, MarketRegion, optional
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const searchString = data.params[4];            // optional
        data.params[4] = searchString !== '*' ? data.params[4] : undefined;
        return data;
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <orderField> [searchString] [type] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - number, The number of the page we want to view. \n'
            + '    <pageLimit>              - number, The number of results per page. \n'
            + '    <order>                  - ENUM{SearchOrder}, The order of the returned results. \n'
            + '    <orderField>             - ENUM{MarketSearchOrderField}, The field to use to sort results.\n'
            + '    <searchString>           - [optional] String, A string that is used to search. \n'
            + '    <type>                   - [optional] MarketType \n'
            + '    <region>                 - [optional] MarketRegion \n';
    }

    public description(): string {
        return 'Search Markets.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' 0 10 \'ASC\'';
    }
}
