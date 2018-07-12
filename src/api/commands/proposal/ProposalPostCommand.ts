import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProposalService } from '../../services/ProposalService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Proposal } from '../../models/Proposal';
import { RpcCommandInterface } from './../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';
import { ProposalCreateRequest } from '../../requests/ProposalCreateRequest';
import { ProposalActionService } from '../../services/ProposalActionService';
import { ProfileService } from '../../services/ProfileService';
import { Profile } from '../../models/Profile';
import { MarketService } from '../../services/MarketService';
import { Market } from '../../models/Market';

export class ProposalPostCommand extends BaseCommand implements RpcCommandInterface<Proposal> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProposalActionService) public proposalActionService: ProposalActionService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService
    ) {
        super(Commands.PROPOSAL_POST);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     * [0] profileId
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        try {
            if (data.params.length < 1) {
                throw new MessageException('Expected <TODO> but recieved no params.');
            }

            // profile that is doing the bidding
            const profileId = data.params.shift();
            let profile: Profile;
            try {
                profile = await this.profileService.findOne(profileId);
            } catch ( ex ) {
                this.log.error(ex);
                throw new MessageException(`Profile with profileId = ${profileId} not found.`);
            }

            const marketId = data.params.shift();
            let market: Market;
            try {
                market = await this.marketService.findOne(marketId);
            } catch ( ex ) {
                this.log.error(ex);
                throw new MessageException(`Market with marketId = ${marketId} not found.`);
            }

            const createRequest: ProposalCreateRequest = {
                submitter: 'submitter',
                blockStart: 1,
                blockEnd: 2,
                type: 'type',
                description: 'description'
            } as ProposalCreateRequest;
            const createdProposal = this.proposalActionService.send(createRequest, profile, market);
            return createdProposal;
        } catch ( ex ) {
            this.log.error('proposal post ex = ' + ex);
            throw ex;
        }
    }

    public help(): string {
        return this.getName() + ' TODO: (command param help)';
    }

    public description(): string {
        return 'TODO: Commands for managing ProposalProposalPostCommand.';
    }

    public example(): string {
        return this.getName() + ' TODO: example';
    }
}
