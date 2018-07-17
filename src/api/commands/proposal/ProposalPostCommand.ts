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
import { ProposalOptionCreateRequest } from '../../requests/ProposalOptionCreateRequest';
import { ProposalActionService } from '../../services/ProposalActionService';
import { ProfileService } from '../../services/ProfileService';
import { Profile } from '../../models/Profile';
import { MarketService } from '../../services/MarketService';
import { Market } from '../../models/Market';
import { ProposalType } from '../../enums/ProposalType';

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
     * [0] proposalDescription
     * [1] blockStart
     * [2] blockEnd
     * [3] submitterAddress
     * [4] option1Description option2Description optionNDescription
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        try {
            if (data.params.length < 3) {
                throw new MessageException('Expected <TODO> but recieved no params.');
            }

            const description = data.params.shift();
            const blockStart = data.params.shift();
            const blockEnd = data.params.shift();

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

            const optionsList: ProposalOptionCreateRequest[] = new Array(data.params.length);
            {
                let optionDesc
                for (let i = 0; optionDesc = data.params.shift(); ++i) {
                    let optionCreateRequest = {
                        optionId: i,
                        description: optionDesc
                    } as ProposalOptionCreateRequest;
                    optionsList[i] = optionCreateRequest;
                }
            }

            const createRequest: ProposalCreateRequest = {
                submitter: 'submitter',
                blockStart,
                blockEnd,
                description,
                options: optionsList,
                type: ProposalType.PUBLIC_VOTE,
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
