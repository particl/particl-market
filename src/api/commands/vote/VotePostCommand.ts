import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { VoteActionService } from '../../services/VoteActionService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Vote } from '../../models/Vote';
import { RpcCommandInterface } from './../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ProfileService } from '../../services/ProfileService';
import { MarketService } from '../../services/MarketService';
import { MessageException } from '../../exceptions/MessageException';
import { ProposalOptionService } from '../../services/ProposalOptionService';
import { ProposalService } from '../../services/ProposalService';
import * as resources from 'resources';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';

export class VotePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

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
     * command description
     * [0] profileId
     * [0] proposalHash
     * [1] proposalOptionId
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<SmsgSendResponse> {
        if (data.params.length < 2) {
            throw new MessageException('Expected <TODO> but received no params.');
        }

        const profileId = data.params.shift();
        const proposalHash = data.params.shift();
        // TODO: for now we'll say this is optionId, but it may not be. May need to change it later to be something else like hash
        const proposalOptionId = data.params.shift();

        const proposalModel = await this.proposalService.findOneByHash(proposalHash);
        const proposal: resources.Proposal = proposalModel.toJSON();

        const proposalOption = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
            return o.optionId === proposalOptionId;
        });

        if (!proposalOption) {
            throw new MessageException(`ProposalOption with proposal hash ${proposalHash} and optionId ${proposalOptionId} not found.`);
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

        return await this.voteActionService.send(proposal, proposalOption, profile, market);
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
