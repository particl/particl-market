import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { FavoriteItemService } from '../services/FavoriteItemService';
import { RpcRequest } from '../requests/RpcRequest';
import { FavoriteItem } from '../models/FavoriteItem';


export class TestCommand {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) public favoriteItemService: FavoriteItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<FavoriteItem>> {
        return this.favoriteItemService.findAll();
    }

}
