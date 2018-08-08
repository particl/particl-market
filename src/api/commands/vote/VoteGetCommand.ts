import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { VoteService } from '../../services/VoteService';
import { ProfileService } from '../../services/ProfileService';
import { ProposalService } from '../../services/ProposalService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Vote } from '../../models/Vote';
import { RpcCommandInterface } from './../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';
import * as resources from 'resources';

export class VoteGetCommand extends BaseCommand implements RpcCommandInterface<Vote> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.VOTE_GET);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     * [0] profileId
     * [1] proposalHash
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        if (data.params.length < 2) {
            throw new MessageException('Expected <TODO> but received no params.');
        }

        // Get profile address from profile id
        const profileId = data.params.shift();
        const profileModel = await this.profileService.findOne(profileId);
        const profile: resources.Profile = profileModel.toJSON();

        // Get proposal id from proposal hash
        const proposalHash = data.params.shift();
        const proposal = await this.proposalService.findOneByHash(proposalHash);

        return await this.voteService.findOneByVoterAndProposal(profile.address, proposal.id);
    }

    public help(): string {
        return this.getName() + ' <profileId> <proposalHash> ';
    }

    public description(): string {
        return 'Get votes on a given proposal by a given submitter. ';
    }

    public example(): string {
        return this.getName() + ' 1 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 ';
    }
}
