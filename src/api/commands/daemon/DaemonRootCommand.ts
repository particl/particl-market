import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';
import { CoreRpcService } from '../../services/CoreRpcService';

export class DaemonRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService
    ) {
        super(Commands.DAEMON_ROOT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: address id
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<void> {
        const command = data.params.shift();
        return await this.coreRpcService.call(command, data.params);
    }

    public help(): string {
        return this.getName() + ' <command>\n'
            + '    <command>    - [TODO] - [TODO]';
    }

    public description(): string {
        return 'TODO';
    }
}
