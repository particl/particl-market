import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { EscrowCreateCommand } from './EscrowCreateCommand';
import { EscrowDestroyCommand } from './EscrowDestroyCommand';
import { EscrowAcceptCommand } from './EscrowAcceptCommand';
import { EscrowRefundCommand } from './EscrowRefundCommand';
import { EscrowReleaseCommand } from './EscrowReleaseCommand';
import { EscrowUpdateCommand } from './EscrowUpdateCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class EscrowRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowCreateCommand) private escrowCreateCommand: EscrowCreateCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowDestroyCommand) private escrowDestroyCommand: EscrowDestroyCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowAcceptCommand) private escrowAcceptCommand: EscrowAcceptCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowRefundCommand) private escrowRefundCommand: EscrowRefundCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowReleaseCommand) private escrowReleaseCommand: EscrowReleaseCommand,
        @inject(Types.Command) @named(Targets.Command.escrow.EscrowUpdateCommand) private escrowUpdateCommand: EscrowUpdateCommand,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.ESCROW_ROOT);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public help(): string {
        return this.getName() + ' (add|update|remove|lock|refund|release) ';
    }

    public description(): string {
        return 'Commands for managing escrow.';
    }
}
