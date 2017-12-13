import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemImageDataService } from '../services/ItemImageDataService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemImageData } from '../models/ItemImageData';
import {RpcCommand} from './RpcCommand';

export class ItemImageDataCreateCommand implements RpcCommand<ItemImageData> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemimagedata.create';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemImageData> {
        return this.itemImageDataService.create({
            dataId: data.params[0] || '',
            protocol: data.params[1] || '',
            encoding: data.params[2] || '',
            data: data.params[3] || ''
        });
    }

    public help(): string {
        return 'ItemImageDataCreateCommand: TODO: Fill in help string.';
    }
}
