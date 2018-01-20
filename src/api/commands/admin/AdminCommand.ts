import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { CommandEnumType } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class AdminCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.RpcCommandFactory) private rpcCommandFactory: RpcCommandFactory
    ) {
        super(new CommandEnumType().ADMIN, rpcCommandFactory);
        this.log = new Logger(__filename);
    }

    /**
     * admin root command, passes the execution to the next command, which is the first in data.params
     *
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {
        return await this.executeNext(data);
    }

    public help(): string {
        return '(data)';
    }

    public example(): string {
        return null;
    }

}
