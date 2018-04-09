import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class ProfileRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(

        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.PROFILE_ROOT);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public usage(): string {
        return this.getName() + ' (get|add|update|remove|address|favorite)  -  ' + this.description();
    }

    public description(): string {
        return 'Commands for managing Profile.';
    }
}
