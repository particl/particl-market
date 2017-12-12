import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ShippingDestinationService } from '../services/ShippingDestinationService';
import { RpcRequest } from '../requests/RpcRequest';
import { ShippingDestination } from '../models/ShippingDestination';
import {RpcCommand} from './RpcCommand';

export class ShippingUpdateCommand implements RpcCommand<ShippingDestination> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'shipping.update';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ShippingDestination> {
        return this.shippingDestinationService.update(data.params[0], {
            country: data.params[1],
            shippingAvailability: data.params[2]
        });
    }

    public help(): string {
        return 'ShippingUpdateCommand: TODO: Fill in help string.';
    }
}
