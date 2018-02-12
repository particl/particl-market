import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';

import { ItemLocationAddCommand } from './ItemLocationAddCommand';
import { ItemLocationRemoveCommand } from './ItemLocationRemoveCommand';
import { ItemLocationUpdateCommand } from './ItemLocationUpdateCommand';

import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class ItemLocationRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationAddCommand) private itemLocationAddCommand: ItemLocationAddCommand,
        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationRemoveCommand) private itemLocationRemoveCommand: ItemLocationRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.itemlocation.ItemLocationUpdateCommand) private itemLocationUpdateCommand: ItemLocationUpdateCommand,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.ITEMLOCATION_ROOT);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public help(): string {
        return this.getName() + ' (add|update|remove) ';
    }

    public description(): string {
        return 'Commands for managing itemlocation.';
    }
}
