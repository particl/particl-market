import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemLocationRepository } from '../repositories/ItemLocationRepository';
import { ItemLocation } from '../models/ItemLocation';
import { ItemLocationCreateRequest } from '../requests/ItemLocationCreateRequest';
import { ItemLocationUpdateRequest } from '../requests/ItemLocationUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { LocationMarkerService } from './LocationMarkerService';


export class ItemLocationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.LocationMarkerService) public locationMarkerService: LocationMarkerService,
        @inject(Types.Repository) @named(Targets.Repository.ItemLocationRepository) public itemLocationRepo: ItemLocationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemLocation>> {
        return this.itemLocationRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemLocation> {
        const itemLocation = await this.itemLocationRepo.findOne(id, withRelated);
        if (itemLocation === null) {
            this.log.warn(`ItemLocation with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemLocation;
    }

    @validate()
    public async create( @request(ItemLocationCreateRequest) data: any): Promise<ItemLocation> {

        const body = JSON.parse(JSON.stringify(data));

        // extract and remove related models from request
        const locationMarker = body.locationMarker || {};
        delete body.locationMarker;

        // If the request body was valid we will create the itemLocation
        const itemLocation = await this.itemLocationRepo.create(body);

        // create related models
        locationMarker.item_location_id = itemLocation.Id;
        await this.locationMarkerService.create(locationMarker);

        // finally find and return the created itemLocation
        const newItemLocation = await this.findOne(itemLocation.Id);
        return newItemLocation;
    }

    @validate()
    public async update(id: number, @request(ItemLocationUpdateRequest) data: any): Promise<ItemLocation> {

        const body = JSON.parse(JSON.stringify(data));
        // find the existing one without related
        const itemLocation = await this.findOne(id, false);

        // set new values
        itemLocation.Region = body.region;
        itemLocation.Address = body.address;

        // update itemLocation record
        const updatedItemLocation = await this.itemLocationRepo.update(id, itemLocation.toJSON());

        // find related record and delete it
        let locationMarker = updatedItemLocation.related('LocationMarker').toJSON();
        await this.locationMarkerService.destroy(locationMarker.id);

        // recreate related data
        locationMarker = body.locationMarker;
        locationMarker.item_location_id = id;
        await this.locationMarkerService.create(locationMarker);

        // finally find and return the updated itemLocation
        const newItemLocation = await this.findOne(id);
        return newItemLocation;
    }

    public async destroy(id: number): Promise<void> {
        await this.itemLocationRepo.destroy(id);
    }

    // TODO: remove
    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemLocation>> {
        return this.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemLocation> {
        return this.findOne(data.params[0]);
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemLocation> {
        return this.create({
            region: data.params[0],
            address: data.params[1],
            locationMarker: {
                markerTitle: data.params[2],
                markerText: data.params[3],
                lat: data.params[4],
                lng: data.params[5]
            }
        });
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemLocation> {
        return this.update(data.params[0], {
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

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

}
