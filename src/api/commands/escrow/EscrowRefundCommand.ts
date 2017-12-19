import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowService } from '../../services/EscrowService';

export class EscrowRefundCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'refundescrow';
    }

    /**
     * data.params[]:
     * [0]: itemhash
     * [1]: accepted
     * [2]: memo
     * [3]: escrowid
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {
        const actionData = {
            itemHash: data.params[0],
            accepted: data.params[1],
            memo: data.params[2],
            escrowId: data.params[3]
        };
        return this.escrowService.refund(actionData);
    }

    public help(): string {
        return 'EscrowRefundCommand: TODO: Fill in help string.';
    }
}
