import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { LocationMarkerService } from '../../services/LocationMarkerService';
import { RpcRequest } from '../../requests/RpcRequest';
import { LocationMarker } from '../../models/LocationMarker';
import {RpcCommand} from '../RpcCommand';

export class LocationMarkerUpdateCommand implements RpcCommand<LocationMarker> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.LocationMarkerService) private locationMarkerService: LocationMarkerService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'locationmarker.update';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<LocationMarker> {
        return this.locationMarkerService.update(data.params[0], {
            markerTitle: data.params[1],
            markerText: data.params[2],
            lat: data.params[3],
            lng: data.params[4]
        });
    }

    public help(): string {
        return 'LocationMarkerUpdateCommand: TODO: Fill in help string.';
    }
}
