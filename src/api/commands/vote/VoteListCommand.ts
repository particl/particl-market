// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { VoteService } from '../../services/VoteService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Vote } from '../../models/Vote';
import { RpcCommandInterface } from './../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class VoteListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Vote>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.VOTE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * List votes
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Vote>> {
        return await this.voteService.findAll();
    }

    public help(): string {
        return this.getName() + ' ';
    }

    public description(): string {
        return 'List votes. ';
    }

    public example(): string {
        return this.getName() + ' ';
    }
}
