import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemLocationService } from '../services/ItemLocationService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemLocation } from '../models/ItemLocation';
import {RpcCommand} from './RpcCommand';

export class ItemLocationFindCommand implements RpcCommand<ItemLocation> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) private itemLocationService: ItemLocationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemlocation.find';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemLocation> {
        return this.itemLocationService.findOne(data.params[0]);

    }

    public help(): string {
        return 'ItemLocationFindCommand: TODO: Fill in help string.';
    }
}
