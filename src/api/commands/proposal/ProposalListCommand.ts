// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProposalService } from '../../services/model/ProposalService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Proposal } from '../../models/Proposal';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ProposalSearchParams } from '../../requests/search/ProposalSearchParams';
import { SearchOrder } from '../../enums/SearchOrder';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import {
    CommandParamValidationRules,
    EnumValidationRule, IdValidationRule, NumberOrAsteriskValidationRule,
    ParamValidationRule
} from '../CommandParamValidation';
import { MarketService } from '../../services/model/MarketService';

export class ProposalListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Proposal>> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService
    ) {
        super(Commands.PROPOSAL_LIST);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new NumberOrAsteriskValidationRule('timeStart', false),
                new NumberOrAsteriskValidationRule('timeEnd', false),
                new EnumValidationRule('proposalCategory', false, 'ProposalCategory',
                    EnumHelper.getValues(ProposalCategory) as string[], ProposalCategory.PUBLIC_VOTE),
                new IdValidationRule('marketId', false),
                new EnumValidationRule('order', false, 'SearchOrder',
                    EnumHelper.getValues(SearchOrder) as string[], SearchOrder.ASC)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     * [0] timeStart | *, optional
     * [1] timeEnd | *, optional
     * [2] category, optional
     * [3] marketId, optional
     * [4] order
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Proposal>> {

        const market: resources.Market = data.params[3];
        const searchParams = {
            timeStart: data.params[0],
            timeEnd: data.params[1],
            category: data.params[2],
            market: market ? market.receiveAddress : undefined,
            order: data.params[4]
        } as ProposalSearchParams;

        // this.log.debug('searchParams: ', JSON.stringify(searchParams, null, 2));
        return await this.proposalService.search(searchParams, true);
    }

    /**
     *
     * list * 100 -> return all proposals which ended before block 100
     * list 100 * -> return all proposals ending after block 100
     * list 100 200 -> return all which are active and closed between 100 200
     *
     * data.params[]:
     * [0] timeStart | *, optional
     * [1] timeEnd | *, optional
     * [2] proposalCategory, optional, default: ProposalCategory.PUBLIC_VOTE
     * [3] marketId -> resources.Market, optional
     * [3] order, optional, default: SearchOrder.ASC
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);
        return data;
    }

    public usage(): string {
        return this.getName() + ' [startTime] [endTime] [proposalCategory] [market] [order] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <startTime>              - number|*, the startTime of the Proposal. \n'
            + '    <endTime>                - number|*, the endTime of the Proposal. \n'
            + '    <category>               - ProposalCategory \n'
            + '    <market>                 - string, market address to search from.\n'
            + '    <order>                  - SearchOrder \n';
    }

    public description(): string {
        return 'Command for retrieving Proposals. ';
    }

    public example(): string {
        return this.getName() + ' * 1540200116000 ITEM_VOTE ASC ';
    }

}
