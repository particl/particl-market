import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { DataAddCommand } from './DataAddCommand';
import { DataCleanCommand } from './DataCleanCommand';
import { DataGenerateCommand } from './DataGenerateCommand';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class DataRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Command) @named(Targets.Command.data.DataAddCommand) private dataAddCommand: DataAddCommand,
        @inject(Types.Command) @named(Targets.Command.data.DataCleanCommand) private dataCleanCommand: DataCleanCommand,
        @inject(Types.Command) @named(Targets.Command.data.DataGenerateCommand) private dataGenerateCommand: DataGenerateCommand,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.DATA_ROOT);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public usage(): string {
        return this.getName() + ' (add|generate|clean)  -  ' + this.description();
    }

    public help(): string {
        return this.usage();
    }

    public description(): string {
        return 'Commands for managing data.';
    }
}
