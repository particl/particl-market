import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemImageService } from '../services/ItemImageService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemImage } from '../models/ItemImage';
import {RpcCommand} from './RpcCommand';

export class ItemImageCreateCommand implements RpcCommand<ItemImage> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemimage.create';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemImage> {
        return this.itemImageService.create({
            hash: data.params[0],
            data: {
                dataId: data.params[1] || '',
                protocol: data.params[2] || '',
                encoding: data.params[3] || '',
                data: data.params[4] || ''
            }
        });
    }

    public help(): string {
        return 'ItemImageCreateCommand: TODO: Fill in help string.';
    }
}
