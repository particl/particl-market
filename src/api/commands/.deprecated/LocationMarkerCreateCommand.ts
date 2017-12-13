import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { LocationMarkerService } from '../services/LocationMarkerService';
import { RpcRequest } from '../requests/RpcRequest';
import { LocationMarker } from '../models/LocationMarker';
import {RpcCommand} from './RpcCommand';

export class LocationMarkerCreateCommand implements RpcCommand<LocationMarker> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.LocationMarkerService) private locationMarkerService: LocationMarkerService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'locationmarker.create';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<LocationMarker> {
        return this.locationMarkerService.create({
            markerTitle: data.params[0],
            markerText: data.params[1],
            lat: data.params[2],
            lng: data.params[3]
        });
    }

    public help(): string {
        return 'LocationMarkerCreateCommand: TODO: Fill in help string.';
    }
}
