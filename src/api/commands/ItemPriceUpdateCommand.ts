import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemPriceService } from '../services/ItemPriceService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemPrice } from '../models/ItemPrice';
import {RpcCommand} from './RpcCommand';

export class ItemPriceUpdateCommand implements RpcCommand<ItemPrice> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemPriceService) private itemPriceService: ItemPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemprice.update';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemPrice> {
        return this.itemPriceService.update(data.params[0], {
            currency: data.params[1],
            basePrice: data.params[2],
            shippingPrice: {
                domestic: data.params[3],
                international: data.params[4]
            },
            address: {
                type: data.params[5],
                address: data.params[6]
            }
        });
    }

    public help(): string {
        return 'ItemPriceUpdateCommand: TODO: Fill in help string.';
    }
}
