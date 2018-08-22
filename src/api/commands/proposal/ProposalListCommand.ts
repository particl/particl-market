// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProposalService } from '../../services/ProposalService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Proposal } from '../../models/Proposal';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';
import { ProposalSearchParams } from '../../requests/ProposalSearchParams';
import { SearchOrder } from '../../enums/SearchOrder';
import { ProposalType } from '../../enums/ProposalType';

export class ProposalListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Proposal>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService
    ) {
        super(Commands.PROPOSAL_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     * [0] startBlock | *, optional
     * [1] endBlock | *, optional
     * [2] order, optional
     * [3] type, optional
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Proposal>> {
        const withRelated = true;
        const searchParams = this.getSearchParams(data.params);
        return await this.proposalService.searchBy(searchParams, withRelated);
    }

    public help(): string {
        return this.getName() + ' <startBlock> <endBlock> <order> <type> ';
    }

    public description(): string {
        return 'Command for retrieving proposals. ';
    }

    public example(): string {
        return this.getName() + ' 1 100000000 ASC ';
    }

    /**
     *
     * list * 100 -> return all proposals which ended before block 100
     * list 100 * -> return all proposals ending after block 100
     * list 100 200 -> return all which are active and closed between 100 200
     *
     * [0] startBlock |*, optional
     * [1] endBlock |*, optional
     * [2] type |*, optional
     * [3] order, optional
     *
     * @param {any[]} params
     * @returns {ProposalSearchParams}
     */
    private getSearchParams(params: any[]): ProposalSearchParams {
        let order: SearchOrder = SearchOrder.ASC;
        let type: ProposalType;
        let startBlock: number | string = '*';
        let endBlock: number | string = '*';

        if (!_.isEmpty(params)) {
            startBlock = params.shift();
            if (typeof startBlock === 'string' && startBlock !== '*') {
                throw new MessageException('startBlock must be a number or *.');
            }
        }

        if (!_.isEmpty(params)) {
            endBlock = params.shift();
            if (typeof endBlock === 'string' && endBlock !== '*') {
                throw new MessageException('endBlock must be a number or *.');
            }
        }

        if (!_.isEmpty(params)) {
            type = params.shift();
            if (type.toUpperCase() === ProposalType.ITEM_VOTE.toString()) {
                type = ProposalType.ITEM_VOTE;
            } else if (type.toUpperCase() === ProposalType.PUBLIC_VOTE.toString()) {
                type = ProposalType.PUBLIC_VOTE;
            } else {
                // anything goes
            }
        } else {
            type = ProposalType.PUBLIC_VOTE; // default
        }

        if (!_.isEmpty(params)) {
            order = params.shift();
            if (order.toUpperCase() === SearchOrder.DESC.toString()) {
                order = SearchOrder.DESC;
            } else {
                order = SearchOrder.ASC;
            }
        } else {
            order = SearchOrder.ASC; // default
        }

        const searchParams = {
            startBlock,
            endBlock,
            order,
            type
        } as ProposalSearchParams;

        this.log.debug('ProposalSearchParams: ', JSON.stringify(searchParams, null, 2));
        return searchParams;
    }
}
