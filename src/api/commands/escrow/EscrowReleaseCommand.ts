import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowService } from '../../services/EscrowService';
import { EscrowReleaseRequest } from '../../requests/EscrowReleaseRequest';
import { EscrowMessageType } from '../../enums/EscrowMessageType';

export class EscrowReleaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'releaseescrow';
        this.helpStr = 'EscrowReleaseCommand: TODO: Fill in help string.';
    }

    /**
     * data.params[]:
     * [0]: itemhash
     * [1]: memo
     * [2]: escrowId
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {
        // TODO: we have the listing hash, why is escrowId being passed here?
        return this.escrowService.release({
            listing: data.params[0],
            memo: data.params[1],
            escrowId: data.params[2],
            action: EscrowMessageType.MPA_RELEASE
        } as EscrowReleaseRequest);
    }

    public help(): string {
        return this.helpStr;
    }
}
