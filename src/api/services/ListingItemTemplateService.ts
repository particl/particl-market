import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ListingItemTemplateRepository } from '../repositories/ListingItemTemplateRepository';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { ListingItemTemplateCreateRequest } from '../requests/ListingItemTemplateCreateRequest';
import { ListingItemTemplateUpdateRequest } from '../requests/ListingItemTemplateUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class ListingItemTemplateService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ListingItemTemplateRepository) public listingItemTemplateRepo: ListingItemTemplateRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItemTemplate>> {
        return this.listingItemTemplateRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ListingItemTemplate> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItemTemplate> {
        const listingItemTemplate = await this.listingItemTemplateRepo.findOne(id, withRelated);
        if (listingItemTemplate === null) {
            this.log.warn(`ListingItemTemplate with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItemTemplate;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ListingItemTemplate> {
        return this.create({
            data: data.params[0] // TODO: convert your params to ListingItemTemplateCreateRequest
        });
    }

    @validate()
    public async create( @request(ListingItemTemplateCreateRequest) body: any): Promise<ListingItemTemplate> {

        // TODO: extract and remove related models from request
        // const listingItemTemplateRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the listingItemTemplate
        const listingItemTemplate = await this.listingItemTemplateRepo.create(body);

        // TODO: create related models
        // listingItemTemplateRelated._id = listingItemTemplate.Id;
        // await this.listingItemTemplateRelatedService.create(listingItemTemplateRelated);

        // finally find and return the created listingItemTemplate
        const newListingItemTemplate = await this.findOne(listingItemTemplate.id);
        return newListingItemTemplate;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ListingItemTemplate> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to ListingItemTemplateUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(ListingItemTemplateUpdateRequest) body: any): Promise<ListingItemTemplate> {

        // find the existing one without related
        const listingItemTemplate = await this.findOne(id, false);

        // set new values

        // update listingItemTemplate record
        const updatedListingItemTemplate = await this.listingItemTemplateRepo.update(id, listingItemTemplate.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let listingItemTemplateRelated = updatedListingItemTemplate.related('ListingItemTemplateRelated').toJSON();
        // await this.listingItemTemplateService.destroy(listingItemTemplateRelated.id);

        // TODO: recreate related data
        // listingItemTemplateRelated = body.listingItemTemplateRelated;
        // listingItemTemplateRelated._id = listingItemTemplate.Id;
        // const createdListingItemTemplate = await this.listingItemTemplateService.create(listingItemTemplateRelated);

        // TODO: finally find and return the updated listingItemTemplate
        // const newListingItemTemplate = await this.findOne(id);
        // return newListingItemTemplate;

        return updatedListingItemTemplate;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemTemplateRepo.destroy(id);
    }

}
