import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemLocationService } from '../services/ItemLocationService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemLocation } from '../models/ItemLocation';
import {RpcCommand} from './RpcCommand';

export class ItemLocationUpdateCommand implements RpcCommand<ItemLocation> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) private itemLocationService: ItemLocationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemlocation.update';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemLocation> {
        return this.itemLocationService.update(data.params[0], {
            region: data.params[1],
            address: data.params[2],
            locationMarker: {
                markerTitle: data.params[3],
                markerText: data.params[4],
                lat: data.params[5],
                lng: data.params[6]
            }
        });
    }

    public help(): string {
        return 'ItemLocationUpdateCommand: TODO: Fill in help string.';
    }
}
