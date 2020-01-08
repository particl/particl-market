// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/model/ProfileService';
import { ProposalService } from '../../services/model/ProposalService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { VoteActionService } from '../../services/action/VoteActionService';
import { IdentityService } from '../../services/model/IdentityService';
import { MarketService } from '../../services/model/MarketService';

export class VoteGetCommand extends BaseCommand implements RpcCommandInterface<resources.Vote> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) public voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.VOTE_GET);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *   [0]: market: resources.Market
     *   [1]: identity, resources.Identity
     *   [2]: proposal: resources.Proposal
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<resources.Vote> {

        const market: resources.Market = data.params[0];
        const identity: resources.Identity = data.params[1];
        const proposal: resources.Proposal = data.params[2];

        return await this.voteActionService.getCombinedVote(identity, proposal);
    }

    /**
     * data.params[]:
     *  [0]: marketId
     *  [1]: proposalHash
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('marketId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('proposalHash');
        }

        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        } else if (data.params[1] && typeof data.params[1] !== 'string') {
            throw new InvalidParamException('proposalHash', 'string');
        }

        // make sure the Market exists
        const market: resources.Market = await this.marketService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        // make sure Identity with the id exists
        const identity: resources.Identity = await this.identityService.findOne(market.Identity.id)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        // make sure Proposal with the hash exists
        const proposal: resources.Proposal = await this.proposalService.findOneByHash(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                this.log.error('Proposal not found. ' + reason);
                throw new ModelNotFoundException('Proposal');
            });

        data.params[0] = market;
        data.params[1] = identity;
        data.params[2] = proposal;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <marketId> <proposalHash>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <marketId>                  - The id of the Market. ' + ' \n'
            + '    <proposalHash>              - The hash of the Proposal. ';
    }

    public description(): string {
        return 'Get SummaryVote for a Proposal. ';
    }

    public example(): string {
        return this.getName() + ' 1 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 ';
    }
}
