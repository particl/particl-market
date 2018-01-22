import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { FavoriteItemService } from '../services/FavoriteItemService';
import { RpcRequest } from '../requests/RpcRequest';
import { FavoriteItem } from '../models/FavoriteItem';
import { RpcCommandInterface } from './RpcCommandInterface';
import { CommandEnumType } from 'CommandEnumType';
import { BaseCommand } from 'BaseCommand';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';

export class TestCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<FavoriteItem>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) public favoriteItemService: FavoriteItemService,
        @inject(Types.Factory) @named(Targets.Factory.RpcCommandFactory) private rpcCommandFactory: RpcCommandFactory
    ) {
        super(new CommandEnumType().TEST, rpcCommandFactory);
        this.log = new Logger(__filename);
    }

    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<FavoriteItem>> {
        return this.favoriteItemService.findAll();
    }

    public help(): string {
        return 'CreateCategoryCommand: TODO: Fill in help string.';
    }

    public example(): any {
        return null;
    }

}
