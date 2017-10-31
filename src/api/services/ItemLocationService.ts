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


export class ItemLocationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemLocationRepository) public itemLocationRepo: ItemLocationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemLocation>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemLocation>> {
        return this.itemLocationRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemLocation> {
        return this.findOne(data.params[0]);
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
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemLocation> {
        return this.create({
            data: data.params[0] // TODO: convert your params to ItemLocationCreateRequest
        });
    }

    @validate()
    public async create( @request(ItemLocationCreateRequest) body: any): Promise<ItemLocation> {

        // TODO: extract and remove related models from request
        // const itemLocationRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the itemLocation
        const itemLocation = await this.itemLocationRepo.create(body);

        // TODO: create related models
        // itemLocationRelated._id = itemLocation.Id;
        // await this.itemLocationRelatedService.create(itemLocationRelated);

        // finally find and return the created itemLocation
        const newItemLocation = await this.findOne(itemLocation.id);
        return newItemLocation;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemLocation> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to ItemLocationUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(ItemLocationUpdateRequest) body: any): Promise<ItemLocation> {

        // find the existing one without related
        const itemLocation = await this.findOne(id, false);

        // set new values
        itemLocation.Region = body.region;
        itemLocation.Address = body.address;

        // update itemLocation record
        const updatedItemLocation = await this.itemLocationRepo.update(id, itemLocation.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let itemLocationRelated = updatedItemLocation.related('ItemLocationRelated').toJSON();
        // await this.itemLocationService.destroy(itemLocationRelated.id);

        // TODO: recreate related data
        // itemLocationRelated = body.itemLocationRelated;
        // itemLocationRelated._id = itemLocation.Id;
        // const createdItemLocation = await this.itemLocationService.create(itemLocationRelated);

        // TODO: finally find and return the updated itemLocation
        // const newItemLocation = await this.findOne(id);
        // return newItemLocation;

        return updatedItemLocation;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.itemLocationRepo.destroy(id);
    }

}
