import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemGetCommand } from './ListingItemGetCommand';
import { ListingItemSearchCommand } from './ListingItemSearchCommand';
import { ListingItemUpdateCommand } from './ListingItemUpdateCommand';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class ListingItemRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Command) @named(Targets.Command.listingitem.ListingItemGetCommand) private listingItemGetCommand: ListingItemGetCommand,
        @inject(Types.Command) @named(Targets.Command.listingitem.ListingItemSearchCommand) private listingItemSearchCommand: ListingItemSearchCommand,
        @inject(Types.Command) @named(Targets.Command.listingitem.ListingItemUpdateCommand) private listingItemUpdateCommand: ListingItemUpdateCommand,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.ITEM_ROOT);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public help(): string {
        return this.getName() + ' (search|get|update) ';
    }

    public description(): string {
        return 'Commands for managing listing items.';
    }
}
