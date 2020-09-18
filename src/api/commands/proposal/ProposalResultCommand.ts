// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProposalResultService } from '../../services/model/ProposalResultService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ProposalResult } from '../../models/ProposalResult';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ProposalService } from '../../services/model/ProposalService';
import { CommandParamValidationRules, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';


export class ProposalResultCommand extends BaseCommand implements RpcCommandInterface<ProposalResult> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalResultService) public proposalResultService: ProposalResultService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.PROPOSAL_RESULT);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new StringValidationRule('proposalHash', true)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * command description
     * [0] proposal: resources.Proposal
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<ProposalResult> {
        const proposal: resources.Proposal = data.params[0];
        return await this.proposalResultService.findLatestByProposalHash(proposal.hash, true);
    }

    /**
     * data.params[]:
     *  [0]: proposalHash
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        data.params[0] = await this.proposalService.findOneByHash(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                this.log.error('Proposal not found. ' + reason);
                throw new ModelNotFoundException('Proposal');
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <proposalHash>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <proposalHash>                - string - The hash of the Proposal. \n';
    }

    public description(): string {
        return ' Command for fetching ProposalResults.';
    }

    public example(): string {
        return this.getName() + ' 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 ';
    }
}
