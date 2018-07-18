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
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { ProfileService } from '../../services/ProfileService';
import { Profile } from '../../models/Profile';
import { ProposalOption } from '../../models/ProposalOption';
import { MarketService } from '../../services/MarketService';
import { Market } from '../../models/Market';
import { MessageException } from '../../exceptions/MessageException';
import { VoteCreateRequest } from '../../requests/VoteCreateRequest';
import { ProposalOptionService } from '../../services/ProposalOptionService';

export class VotePostCommand extends BaseCommand implements RpcCommandInterface<Vote> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.VoteActionService) public voteActionService: VoteActionService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionService) public proposalOptionService: ProposalOptionService
    ) {
        super(Commands.VOTE_POST);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     * [0] proposalHash
     * [1] proposalOption
     * [2] submitterAddress
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Vote> {
        if (data.params.length < 2) {
            throw new MessageException('Expected <TODO> but recieved no params.');
        }

        const proposalHash = data.params.shift();
        // TODO: for now we'll say this is optionId, but it may not be. May need to change it later to be something else like hash
        const proposalOptionId = data.params.shift();

        // TODO: Get proposal option by proposalHash and proposalOptionId
        // TODO: Extract id from proposalOption
        const proposalOption: ProposalOption = await this.proposalOptionService.findOneFromHashAndOptionId(proposalHash, proposalOptionId);
        if (!proposalOption) {
            throw new MessageException(`Proposal option with proposal hash ${proposalHash} and optionId ${proposalOptionId} not found.`);
        }

        // Get profile from address.
        // Profile that is doing the bidding.
        const profileAddress = data.params.shift();
        const profile = await this.profileService.findOneByAddress(profileAddress);
        if (!profile) {
            throw new MessageException(`Profile with address <${profileAddress}> doesn't exist or doesn't belong to us.`);
        }

        // Get the default market.
        // TODO: Might want to let users specify this later.
        const market = await this.marketService.getDefault();
        if (!market) {
            throw new MessageException(`Default market doesn't exist!`);
        }

        const voteCreateRequest = {
            proposalOptionId: proposalOption.id,
            voter: profileAddress,
            block: 0,
            weight: 1.0
        } as VoteCreateRequest;
        return await this.voteActionService.send(voteCreateRequest, profile, market)
    }

    public help(): string {
        return this.getName() + ' TODO: (command param help)';
    }

    public description(): string {
        return 'TODO: Commands for managing VotePostCommand.';
    }

    public example(): string {
        return this.getName() + ' TODO: example';
    }
}
