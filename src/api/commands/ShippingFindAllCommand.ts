import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ShippingDestinationService } from '../services/ShippingDestinationService';
import { RpcRequest } from '../requests/RpcRequest';
import { ShippingDestination } from '../models/ShippingDestination';
import {RpcCommand} from './RpcCommand';

export class ShippingFindAllCommand implements RpcCommand<Bookshelf.Collection<ShippingDestination>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'shipping.findall';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ShippingDestination>> {
        return this.shippingDestinationService.findAll();
    }

    public help(): string {
        return 'ShippingFindAllCommand: TODO: Fill in help string.';
    }
}
