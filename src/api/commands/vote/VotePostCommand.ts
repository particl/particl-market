// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { VoteActionService } from '../../services/VoteActionService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ProfileService } from '../../services/ProfileService';
import { MarketService } from '../../services/MarketService';
import { MessageException } from '../../exceptions/MessageException';
import { ProposalService } from '../../services/ProposalService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class VotePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.VoteActionService) public voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService
    ) {
        super(Commands.VOTE_POST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: proposalHash
     *  [2]: proposalOptionId
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<SmsgSendResponse[]> {

        const profileId = data.params[0];
        const proposalHash = data.params[1];
        // TODO: for now we'll use optionId, but we should propably use the proposalOptionHash
        const proposalOptionId = data.params[2];

        const proposal: resources.Proposal = await this.proposalService.findOneByHash(proposalHash)
            .then(value => value.toJSON());

        const proposalOption = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
            return o.optionId === proposalOptionId;
        }) || {} as resources.ProposalOption; // validate() makes sure proposalOption != undefined, this just fixes the TS code validation

        const profile: resources.Profile = await this.profileService.findOne(profileId)
            .then(value => value.toJSON());

        // TODO: might want to let users specify this later.
        const market: resources.Market = await this.marketService.getDefault()
            .then(value => value.toJSON());

        return await this.voteActionService.vote(profile, market, proposal, proposalOption);

    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: proposalHash
     *  [2]: proposalOptionId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('proposalHash');
        } else if (data.params.length < 3) {
            throw new MissingParamException('proposalOptionId');
        }

        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (data.params[1] && typeof data.params[1] !== 'string') {
            throw new InvalidParamException('proposalHash', 'string');
        } else if (data.params[2] && typeof data.params[2] !== 'number') {
            throw new InvalidParamException('proposalOptionId', 'number');
        }

        // make sure Profile with the id exists
        await this.profileService.findOne(data.params[0])
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        // make sure Proposal with the id exists
        const proposal: resources.Proposal = await this.proposalService.findOneByHash(data.params[1])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('Proposal');
            });

        // make sure ProposalOption exists
        const proposalOption: resources.ProposalOption | undefined = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
            return o.optionId === data.params[2];
        });
        if (!proposalOption) {
            throw new MessageException('ProposalOption ' + data.params[2] + ' not found.');
        }

        return data;
    }

    public help(): string {
        return this.getName() + ' <profileId> <proposalHash> <proposalOptionId> ';
    }

    public description(): string {
        return 'Vote on a proposal specified via hash. ';
    }

    public example(): string {
        return this.getName() + ' 1 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 0';
    }
}
