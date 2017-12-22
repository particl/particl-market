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

        // If the request body was valid we will create the locationMarker
        const locationMarker = await this.locationMarkerRepo.create(body);

        // finally find and return the created locationMarker
        return await this.findOne(locationMarker.Id);
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

    // TODO: REMOVE
    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<LocationMarker>> {
        return this.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<LocationMarker> {
        return this.findOne(data.params[0]);
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<LocationMarker> {
        return this.create({
            markerTitle: data.params[0],
            markerText: data.params[1],
            lat: data.params[2],
            lng: data.params[3]
        });
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<LocationMarker> {
        return this.update(data.params[0], {
            markerTitle: data.params[1],
            markerText: data.params[2],
            lat: data.params[3],
            lng: data.params[4]
        });
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

}
