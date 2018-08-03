import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from './../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';
import { ProposalActionService } from '../../services/ProposalActionService';
import { ProfileService } from '../../services/ProfileService';
import { MarketService } from '../../services/MarketService';
import { ProposalType } from '../../enums/ProposalType';
import * as resources from 'resources';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';

export class ProposalPostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

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
     * [1] proposalTitle
     * [2] proposalDescription
     * [3] blockStart
     * [4] blockEnd
     * [5] option1Description
     * [n...] optionNDescription
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<SmsgSendResponse> {

        // todo add validation in separate function..
        if (data.params.length < 7) {
            throw new MessageException('Expected <TODO> but received no params.');
        }

        const type = ProposalType.PUBLIC_VOTE;
        const profileId = data.params.shift();
        const proposalTitle = data.params.shift();
        const proposalDescription = data.params.shift();
        const blockStart = data.params.shift();
        const blockEnd = data.params.shift();

        if (typeof profileId !== 'number') {
            throw new MessageException('profileId needs to be a number.');
        } else if (typeof blockStart !== 'number') {
            throw new MessageException('blockStart needs to be a number.');
        } else if (typeof blockEnd !== 'number') {
            throw new MessageException('blockEnd needs to be a number.');
        }

        let profile: resources.Profile;
        try {
            const profileModel = await this.profileService.findOne(profileId);
            profile = profileModel.toJSON();
        } catch ( ex ) {
            this.log.error(ex);
            throw new MessageException('Profile not found.');
        }

        // Get the default market.
        // TODO: Might want to let users specify this later.
        let market: resources.Market;
        const marketModel = await this.marketService.getDefault();
        if (!marketModel) {
            throw new MessageException(`Default market doesn't exist!`);
        }
        market = marketModel.toJSON();

        // rest of the data.params are option descriptions
        const optionsList: string[] = data.params;

        return this.proposalActionService.send(type, proposalTitle, proposalDescription, blockStart, blockEnd,
            optionsList, profile, market);
    }

    public help(): string {
        return this.getName() + ' TODO: (command param help)';
    }

    public description(): string {
        return 'TODO: Commands for posting Proposals.';
    }

    public example(): string {
        return this.getName() + ' TODO: example';
    }
}
