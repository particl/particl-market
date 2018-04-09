import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class ListingItemTemplateRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;
    // tslint:disable:max-line-length
    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.TEMPLATE_ROOT);
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public usage(): string {
        return this.getName() + ' (search|get|add|remove|post)  -  ' + this.description();
    }

    public help(): string {
        return this.usage();
    }

    public description(): string {
        return 'Commands for managing listingitem template.';
    }
}
