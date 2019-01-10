// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { VoteActionService } from '../../services/VoteActionService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from './../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ProfileService } from '../../services/ProfileService';
import { MarketService } from '../../services/MarketService';
import { MessageException } from '../../exceptions/MessageException';
import { ProposalService } from '../../services/ProposalService';
import * as resources from 'resources';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { CoreRpcService } from '../../services/CoreRpcService';

export class VotePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.VoteActionService) public voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService
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
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<SmsgSendResponse> {

        const profileId = data.params.shift();
        const proposalHash = data.params.shift();
        // TODO: for now we'll use optionId, we may need to change it later to be something else like hash
        const proposalOptionId = data.params.shift();

        const proposalModel = await this.proposalService.findOneByHash(proposalHash)
            .catch(reason => {
                throw new MessageException('Proposal not found.');
            });
        const proposal: resources.Proposal = proposalModel.toJSON();
        const proposalOption = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
            return o.optionId === proposalOptionId;
        });

        if (!proposalOption) {
            throw new MessageException(`ProposalOption not found.`);
        }

        // Get profile from address.
        // Profile that is doing the bidding.
        const profileModel = await this.profileService.findOne(profileId);
        if (!profileModel) {
            throw new MessageException(`Profile with profileId <${profileId}> doesn't exist or doesn't belong to us.`);
        }
        const profile: resources.Profile = profileModel.toJSON();

        // Get the default market.
        // TODO: Might want to let users specify this later.
        const marketModel = await this.marketService.getDefault();
        if (!marketModel) {
            throw new MessageException(`Default market doesn't exist!`);
        }
        const market: resources.Market = marketModel.toJSON();

        const addrCollection: any = await this.coreRpcService.getWalletAddresses();
        let voteMsg;
        for (const addr of addrCollection) {
            this.log.debug('Sending vote for ' + addr.address);
            voteMsg = await this.voteActionService.send(proposal, proposalOption, addr.address, market);
            this.log.debug('Sending vote for ' + addr.address + ': DONE');
        }
        return voteMsg;
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
        if (data.params.length < 3) {
            throw new MessageException('Missing params.');
        }

        if (typeof data.params[0] !== 'number') {
            throw new MessageException('Invalid profileId.');
        }

        if (typeof data.params[1] !== 'string') {
            throw new MessageException('Invalid proposalHash.');
        }

        if (typeof data.params[2] !== 'number') {
            throw new MessageException('Invalid proposalOptionId.');
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
