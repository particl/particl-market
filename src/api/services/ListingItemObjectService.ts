import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';
import { ListingItemObjectRepository } from '../repositories/ListingItemObjectRepository';
import { ListingItemObject } from '../models/ListingItemObject';
import { ListingItemObjectCreateRequest } from '../requests/ListingItemObjectCreateRequest';
import { ListingItemObjectUpdateRequest } from '../requests/ListingItemObjectUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItemObjectSearchParams } from '../requests/ListingItemObjectSearchParams';

export class ListingItemObjectService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ListingItemObjectRepository) public listingItemObjectRepo: ListingItemObjectRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.listingItemObjectRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItemObject> {
        const listingItemObject = await this.listingItemObjectRepo.findOne(id, withRelated);
        if (listingItemObject === null) {
            this.log.warn(`ListingItemObject with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItemObject;
    }

    /**
     * search ListingItemObject using given ListingItemObjectSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItemObject>>}
     */
    @validate()
    public async search(
        @request(ListingItemObjectSearchParams) options: ListingItemObjectSearchParams
        ): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.listingItemObjectRepo.search(options);
    }

    @validate()
    public async create( @request(ListingItemObjectCreateRequest) body: any): Promise<ListingItemObject> {

        // todo: could this be annotated in ListingItemObjectCreateRequest?
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // If the request body was valid we will create the listingItemObject
        const listingItemObject = await this.listingItemObjectRepo.create(body);

        // finally find and return the created listingItemObject
        const newListingItemObject = await this.findOne(listingItemObject.id);
        return newListingItemObject;
    }

    @validate()
    public async update(id: number, @request(ListingItemObjectUpdateRequest) body: any): Promise<ListingItemObject> {

        // todo: could this be annotated in ListingItemObjectUpdateRequest?
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // find the existing one without related
        const listingItemObject = await this.findOne(id, false);

        // set new values
        listingItemObject.Type = body.type;
        listingItemObject.Description = body.description;
        listingItemObject.Order = body.order;

        // update listingItemObject record
        const updatedListingItemObject = await this.listingItemObjectRepo.update(id, listingItemObject.toJSON());

        // TODO:

        return updatedListingItemObject;
    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemObjectRepo.destroy(id);
    }

    // TODO: remove
    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ListingItemObject> {
        return this.findOne(data.params[0]);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.findAll();
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ListingItemObject> {
        return this.create({
            data: data.params[0] // TODO: convert your params to ListingItemObjectCreateRequest
        });
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ListingItemObject> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to ListingItemObjectUpdateRequest
        });
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

}
