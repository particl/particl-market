import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { FavoriteListCommand } from './FavoriteListCommand';
import { FavoriteAddCommand } from './FavoriteAddCommand';
import { FavoriteRemoveCommand } from './FavoriteRemoveCommand';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class FavoriteRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteListCommand) private favoriteListCommand: FavoriteListCommand,
        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteAddCommand) private favoriteAddCommand: FavoriteAddCommand,
        @inject(Types.Command) @named(Targets.Command.favorite.FavoriteRemoveCommand) private favoriteRemoveCommand: FavoriteRemoveCommand,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.FAVORITE_ROOT);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public help(): string {
        return this.getName() + ' (list|add|remove)';
    }

    public description(): string {
        return 'Commands for managing favorite listings.';
    }
}
