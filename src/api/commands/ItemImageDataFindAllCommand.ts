import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemImageDataService } from '../services/ItemImageDataService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemImageData } from '../models/ItemImageData';
import {RpcCommand} from './RpcCommand';

export class ItemImageDataFindAllCommand implements RpcCommand<Bookshelf.Collection<ItemImageData>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemimagedata.findall';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemImageData>> {
        return this.itemImageDataService.findAll();
    }

    public help(): string {
        return 'ItemImageDataFindAllCommand: TODO: Fill in help string.';
    }
}
