import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateAddCommand } from './ListingItemTemplateAddCommand';
import { ListingItemTemplateRemoveCommand } from './ListingItemTemplateRemoveCommand';
import { ListingItemTemplateGetCommand } from './ListingItemTemplateGetCommand';
import { ListingItemTemplatePostCommand } from './ListingItemTemplatePostCommand';
import { ListingItemTemplateSearchCommand } from './ListingItemTemplateSearchCommand';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class ListingItemTemplateRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;
    // tslint:disable:max-line-length
    constructor(
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateAddCommand) private listingItemTemplateAddCommand: ListingItemTemplateAddCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateRemoveCommand) private listingItemTemplateRemoveCommand: ListingItemTemplateRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateGetCommand) private listingItemTemplateGetCommand: ListingItemTemplateGetCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplatePostCommand) private listingItemTemplatePostCommand: ListingItemTemplatePostCommand,
        @inject(Types.Command) @named(Targets.Command.listingitemtemplate.ListingItemTemplateSearchCommand) private listingItemTemplateSearchCommand: ListingItemTemplateSearchCommand,
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

    public help(): string {
        // return this.getName() + ' (search | get | add | remove | information | image | location | import)';
        return this.getName() + ' (search | get | add | remove)';
    }

    public description(): string {
        return 'Commands for managing listingitem template.';
    }
}
