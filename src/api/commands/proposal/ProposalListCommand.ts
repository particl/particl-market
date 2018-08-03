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
import { MessageException } from '../../exceptions/MessageException';
import { ProposalSearchParams } from '../../requests/ProposalSearchParams';
import { SearchOrder } from '../../enums/SearchOrder';

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
     * [0] startBlock
     * [1] endBlock
     * [2] order
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        const startBlock = data.params.shift();
        const endBlock = data.params.shift();
        let order = data.params.shift();

        if (typeof startBlock !== 'number') {
            throw new MessageException(`startBlock must be a number. Received: <${startBlock}>.`);
        }

        if (typeof endBlock !== 'number') {
            throw new MessageException(`endBlock must be a number. Received: <${endBlock}>.`);
        }

        if (order === SearchOrder.ASC) {
            order = SearchOrder.ASC;
        } else if (order === SearchOrder.DESC) {
            order = SearchOrder.DESC;
        } else {
            order = SearchOrder.ASC;
        }

        const searchParams = {
            order,
            withRelated: true,
            startBlock,
            endBlock
        } as ProposalSearchParams;
        return await this.proposalService.searchBy(searchParams);
    }

    public help(): string {
        return this.getName() + ' <startBlock> <endBlock> <order> ';
    }

    public description(): string {
        return 'Command for retrieving proposals. ';
    }

    public example(): string {
        return this.getName() + ' 1 100000000 ASC ';
    }
}
