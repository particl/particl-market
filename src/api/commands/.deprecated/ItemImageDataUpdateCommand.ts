import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageDataService } from '../../services/ItemImageDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImageData } from '../../models/ItemImageData';
import {RpcCommand} from '../RpcCommand';

export class ItemImageDataUpdateCommand implements RpcCommand<ItemImageData> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemimagedata.update';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemImageData> {
        return this.itemImageDataService.update(data.params[0], {
            dataId: data.params[1] || '',
            protocol: data.params[2] || '',
            encoding: data.params[3] || '',
            data: data.params[4] || ''
        });
    }

    public help(): string {
        return 'ItemImageDataUpdateCommand: TODO: Fill in help string.';
    }
}
