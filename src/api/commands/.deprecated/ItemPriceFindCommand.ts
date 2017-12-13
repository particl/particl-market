import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemPriceService } from '../services/ItemPriceService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemPrice } from '../models/ItemPrice';
import {RpcCommand} from './RpcCommand';

export class ItemPriceFindCommand implements RpcCommand<ItemPrice> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemPriceService) private itemPriceService: ItemPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemprice.find';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemPrice> {
        return this.itemPriceService.findOne(data.params[0]);
    }

    public help(): string {
        return 'ItemPriceFindCommand: TODO: Fill in help string.';
    }
}
