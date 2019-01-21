// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProposalResultService } from '../../services/ProposalResultService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from './../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';
import { ProposalResult } from '../../models/ProposalResult';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ProposalResultCommand extends BaseCommand implements RpcCommandInterface<ProposalResult> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.PROPOSAL_RESULT);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     * [0] proposalHash
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<ProposalResult> {
        const proposalHash = data.params[0];
        return await this.proposalResultService.findLatestByProposalHash(proposalHash, true);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('proposalHash');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('proposalHash', 'string');
        }
        return data;
    }

    public help(): string {
        return this.getName() + ' results <proposalHash>';
    }

    public description(): string {
        return ' Command for checking the results of a proposal.';
    }

    public example(): string {
        return this.getName() + ' 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 ';
    }
}
