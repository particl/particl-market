import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';
import { ItemInformationCreateCommand } from './ItemInformationCreateCommand';
import { ItemInformationGetCommand } from './ItemInformationGetCommand';
import { ItemInformationUpdateCommand } from './ItemInformationUpdateCommand';

export class ItemInformationRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationCreateCommand)
            private itemInformationCreateCommand: ItemInformationCreateCommand,
        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationGetCommand)
            private itemInformationGetCommand: ItemInformationGetCommand,
        @inject(Types.Command) @named(Targets.Command.iteminformation.ItemInformationUpdateCommand)
            private itemInformationUpdateCommand: ItemInformationUpdateCommand,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.ITEMINFORMATION_ROOT);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public help(): string {
        return this.getName() + ' (get|add|update)';
    }

    public description(): string {
        return 'Commands for managing iteminformations.';
    }
}
