import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemImageDataService } from '../services/ItemImageDataService';
import { RpcRequest } from '../requests/RpcRequest';
import {RpcCommand} from './RpcCommand';

export class ItemImageDataDestroyCommand implements RpcCommand<void> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemimagedata.destroy';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        return this.itemImageDataService.destroy(data.params[0]);
    }

    public help(): string {
        return 'ItemImageDataDestroyCommand: TODO: Fill in help string.';
    }
}
