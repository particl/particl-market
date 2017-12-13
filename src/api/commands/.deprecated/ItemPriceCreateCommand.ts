import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemPriceService } from '../services/ItemPriceService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemPrice } from '../models/ItemPrice';
import {RpcCommand} from './RpcCommand';

export class ItemPriceCreateCommand implements RpcCommand<ItemPrice> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemPriceService) private itemPriceService: ItemPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemprice.create';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemPrice> {
        return this.itemPriceService.create({
            currency: data.params[0],
            basePrice: data.params[1],
            shippingPrice: {
                domestic: data.params[2],
                international: data.params[3]
            },
            address: {
                type: data.params[4],
                address: data.params[5]
            }
        });
    }

    public help(): string {
        return 'ItemPriceCreateCommand: TODO: Fill in help string.';
    }
}
