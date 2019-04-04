// Copyright (c) 2017-2019, The Particl Market developers
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
import { ProposalCategory } from '../../enums/ProposalCategory';
import {MissingParamException} from '../../exceptions/MissingParamException';
import {InvalidParamException} from '../../exceptions/InvalidParamException';

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
     * data.params[]:
     * [0] timeStart | *, optional
     * [1] timeEnd | *, optional
     * [2] category, optional
     * [3] order, optional
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Proposal>> {
        const searchParams = {
            timeStart: data.params[0],
            timeEnd: data.params[1],
            category: data.params[2],
            order: data.params[3]
        } as ProposalSearchParams;

        this.log.debug('searchParams: ', JSON.stringify(searchParams, null, 2));
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
     * [2] category, optional
     * [3] order, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        let timeStart: number | string = '*';
        let timeEnd: number | string = '*';
        let type: ProposalCategory = ProposalCategory.PUBLIC_VOTE;
        let order: SearchOrder = SearchOrder.ASC;

        if (_.isString(data.params[0]) || (_.isFinite(data.params[0]) && +data.params[0] > 0) ) {
            timeStart = data.params[0];
            if (typeof timeStart === 'string' && timeStart !== '*') {
                throw new InvalidParamException('timeStart', 'number or \'*\'');
            }
        }

        if (_.isString(data.params[1]) || (_.isFinite(data.params[1]) && +data.params[1] > 0) ) {
            timeEnd = data.params[1];
            if (typeof timeEnd === 'string' && timeEnd !== '*') {
                throw new InvalidParamException('timeEnd', 'number or \'*\'');
            }
        }

        if (_.isString(data.params[2]) && data.params[2].length) {
            type = data.params[2];
            if (type.toUpperCase() === ProposalCategory.ITEM_VOTE.toString()) {
                type = ProposalCategory.ITEM_VOTE;
            } else if (type.toUpperCase() === ProposalCategory.PUBLIC_VOTE.toString()) {
                type = ProposalCategory.PUBLIC_VOTE;
            } else {
                type = ProposalCategory.PUBLIC_VOTE;
            }
        } else {
            type = ProposalCategory.PUBLIC_VOTE; // default
        }

        if (_.isString(data.params[3]) && data.params[3].length) {
            order = data.params[3];
            if (order.toUpperCase() === SearchOrder.DESC.toString()) {
                order = SearchOrder.DESC;
            } else {
                order = SearchOrder.ASC;
            }
        }

        data.params = [];
        data.params[0] = timeStart;
        data.params[1] = timeEnd;
        data.params[2] = type;
        data.params[3] = order;
        return data;
    }

    public help(): string {
        return this.getName() + ' <startTime> <endTime> <category> <order> ';
    }

    public description(): string {
        return 'Command for retrieving proposals. ';
    }

    public example(): string {
        return this.getName() + ' * 1540200116000 ITEM_VOTE ASC ';
    }

}
