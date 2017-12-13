import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageDataService } from '../../services/ItemImageDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImageData } from '../../models/ItemImageData';
import {RpcCommand} from '../RpcCommand';

export class ItemImageDataFindCommand implements RpcCommand<ItemImageData> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemimagedata.find';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemImageData> {
        return this.itemImageDataService.findOne(data.params[0]);
    }

    public help(): string {
        return 'ItemImageDataFindCommand: TODO: Fill in help string.';
    }
}
