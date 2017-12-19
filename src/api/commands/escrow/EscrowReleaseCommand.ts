import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowService } from '../../services/EscrowService';

export class EscrowReleaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'releaseescrow';
    }

    /**
     * data.params[]:
     * [0]: itemhash
     * [1]: memo
     * [2]: escrowid
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {
        const actionData = {
            itemHash: data.params[0],
            memo: data.params[1],
            escrowId: data.params[2]
        };
        return this.escrowService.release(actionData);
    }

    public help(): string {
        return 'EscrowReleaseCommand: TODO: Fill in help string.';
    }
}
