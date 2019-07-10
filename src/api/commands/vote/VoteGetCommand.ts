// Copyright (c) 2017-2019, The Particl Market developers
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

export class VoteGetCommand extends BaseCommand implements RpcCommandInterface<resources.Vote> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) public voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.VOTE_GET);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *  [0]: profile: resources.Profile
     *  [1]: proposal: resources.Proposal
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<resources.Vote> {

        const profile: resources.Profile = data.params[0];
        const proposal: resources.Proposal = data.params[1];

        return await this.voteActionService.getCombinedVote(profile, proposal);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: proposalHash
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('proposalHash');
        }

        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (data.params[1] && typeof data.params[1] !== 'string') {
            throw new InvalidParamException('proposalHash', 'string');
        }

        // make sure profile with the id exists
        const profile: resources.Profile = await this.profileService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                this.log.error('Profile not found. ' + reason);
                throw new ModelNotFoundException('Profile');
            });

        // make sure proposal with the hash exists
        const proposal: resources.Proposal = await this.proposalService.findOneByHash(data.params[1])
            .then(value => value.toJSON())
            .catch(reason => {
                this.log.error('Proposal not found. ' + reason);
                throw new ModelNotFoundException('Proposal');
            });

        data.params[0] = profile;
        data.params[1] = proposal;

        return data;
    }

    public help(): string {
        return this.getName() + ' <profileId> <proposalHash>';
    }

    public description(): string {
        return 'Get votes on a given proposal by a given submitter. ';
    }

    public example(): string {
        return this.getName() + ' 1 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 ';
    }
}
