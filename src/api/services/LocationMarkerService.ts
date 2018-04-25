import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { LocationMarkerRepository } from '../repositories/LocationMarkerRepository';
import { LocationMarker } from '../models/LocationMarker';
import { LocationMarkerCreateRequest } from '../requests/LocationMarkerCreateRequest';
import { LocationMarkerUpdateRequest } from '../requests/LocationMarkerUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class LocationMarkerService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.LocationMarkerRepository) public locationMarkerRepo: LocationMarkerRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<LocationMarker>> {
        return this.locationMarkerRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<LocationMarker> {
        const locationMarker = await this.locationMarkerRepo.findOne(id, withRelated);
        if (locationMarker === null) {
            this.log.warn(`LocationMarker with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return locationMarker;
    }

    @validate()
    public async create( @request(LocationMarkerCreateRequest) body: LocationMarkerCreateRequest): Promise<LocationMarker> {
        const startTime = new Date().getTime();

        // If the request body was valid we will create the locationMarker
        const locationMarker = await this.locationMarkerRepo.create(body);

        // finally find and return the created locationMarker
        const result = await this.findOne(locationMarker.Id);
        this.log.debug('locationMarkerService.create: ' + (new Date().getTime() - startTime) + 'ms');
        return result;
    }

    @validate()
    public async update(id: number, @request(LocationMarkerUpdateRequest) body: LocationMarkerUpdateRequest): Promise<LocationMarker> {

        // find the existing one without related
        const locationMarker = await this.findOne(id, false);

        // set new values
        locationMarker.MarkerTitle = body.markerTitle;
        locationMarker.MarkerText = body.markerText;
        locationMarker.Lat = body.lat;
        locationMarker.Lng = body.lng;

        // update locationMarker record
        const updatedLocationMarker = await this.locationMarkerRepo.update(id, locationMarker.toJSON());
        return updatedLocationMarker;
    }

    public async destroy(id: number): Promise<void> {
        await this.locationMarkerRepo.destroy(id);
    }
}
