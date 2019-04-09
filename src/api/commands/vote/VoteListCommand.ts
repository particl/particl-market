// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProposalService } from '../../services/model/ProposalService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class VoteListCommand extends BaseCommand implements RpcCommandInterface<resources.Vote[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.VOTE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *  [0]: proposalHash
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<resources.Vote[]> {

        const proposalHash = data.params[0];

        const proposal: resources.Proposal = await this.proposalService.findOneByHash(proposalHash)
            .then(value => value.toJSON());

        const votes: resources.Vote[] = [];
        for (const proposalOption of proposal.ProposalOptions) {
            votes.push(...proposalOption.Votes);
        }
        return votes;
    }

    /**
     * data.params[]:
     *  [0]: proposalHash
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('proposalHash');
        }

        if (data.params[0] && typeof data.params[0] !== 'string') {
            throw new InvalidParamException('proposalHash', 'string');
        }

        // make sure proposal with the hash exists
        await this.proposalService.findOneByHash(data.params[0])
            .catch(reason => {
                this.log.error('Proposal not found. ' + reason);
                throw new ModelNotFoundException('Proposal');
            });

        return data;
    }

    public help(): string {
        return this.getName() + ' <proposalHash>';
    }

    public description(): string {
        return 'List Votes on a given Proposal.';
    }

    public example(): string {
        return this.getName() + ' 1 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 ';
    }
}
