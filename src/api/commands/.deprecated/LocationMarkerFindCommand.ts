import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { LocationMarkerService } from '../../services/LocationMarkerService';
import { RpcRequest } from '../../requests/RpcRequest';
import { LocationMarker } from '../../models/LocationMarker';
import {RpcCommand} from '../RpcCommand';

export class LocationMarkerFindCommand implements RpcCommand<LocationMarker> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.LocationMarkerService) private locationMarkerService: LocationMarkerService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'locationmarker.find';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<LocationMarker> {
        return this.locationMarkerService.findOne(data.params[0]);
    }

    public help(): string {
        return 'LocationMarkerFindCommand: TODO: Fill in help string.';
    }
}
