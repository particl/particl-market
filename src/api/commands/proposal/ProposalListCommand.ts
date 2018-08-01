import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProposalService } from '../../services/ProposalService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Proposal } from '../../models/Proposal';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { NotImplementedException } from '../../exceptions/NotImplementedException';

export class ProposalListCommand extends BaseCommand implements RpcCommandInterface<Proposal> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService
    ) {
        super(Commands.PROPOSAL_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.proposalService.findAll(true);
    }

    public help(): string {
        return this.getName() + ' TODO: (command param help)';
    }

    public description(): string {
        return 'TODO: Commands for managing ProposalProposalListCommand.';
    }

    public example(): string {
        return this.getName() + ' TODO: example';
    }
}
