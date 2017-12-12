import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { EscrowService } from '../services/EscrowService';
import { RpcRequest } from '../requests/RpcRequest';
import {RpcCommand} from './RpcCommand';

export class DestroyEscrowCommand implements RpcCommand<void> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'destroyescrow';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        return this.escrowService.destroyCheckByListingItem(data.params[0]);
    }

    public help(): string {
        return 'DestroyEscrowCommand: TODO: Fill in help string.';
    }
}
