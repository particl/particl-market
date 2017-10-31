import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ListingItemRepository } from '../repositories/ListingItemRepository';
import { ListingItem } from '../models/ListingItem';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemUpdateRequest } from '../requests/ListingItemUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class ListingItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ListingItemRepository) public listingItemRepo: ListingItemRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItem>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItem>> {
        return this.listingItemRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ListingItem> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItem> {
        const listingItem = await this.listingItemRepo.findOne(id, withRelated);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItem;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ListingItem> {
        return this.create({
            data: data.params[0] // TODO: convert your params to ListingItemCreateRequest
        });
    }

    @validate()
    public async create( @request(ListingItemCreateRequest) body: any): Promise<ListingItem> {

        // TODO: extract and remove related models from request
        // const listingItemRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the listingItem
        const listingItem = await this.listingItemRepo.create(body);

        // TODO: create related models
        // listingItemRelated._id = listingItem.Id;
        // await this.listingItemRelatedService.create(listingItemRelated);

        // finally find and return the created listingItem
        const newListingItem = await this.findOne(listingItem.id);
        return newListingItem;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ListingItem> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to ListingItemUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(ListingItemUpdateRequest) body: any): Promise<ListingItem> {

        // find the existing one without related
        const listingItem = await this.findOne(id, false);

        // set new values

        // update listingItem record
        const updatedListingItem = await this.listingItemRepo.update(id, listingItem.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let listingItemRelated = updatedListingItem.related('ListingItemRelated').toJSON();
        // await this.listingItemService.destroy(listingItemRelated.id);

        // TODO: recreate related data
        // listingItemRelated = body.listingItemRelated;
        // listingItemRelated._id = listingItem.Id;
        // const createdListingItem = await this.listingItemService.create(listingItemRelated);

        // TODO: finally find and return the updated listingItem
        // const newListingItem = await this.findOne(id);
        // return newListingItem;

        return updatedListingItem;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemRepo.destroy(id);
    }

}
