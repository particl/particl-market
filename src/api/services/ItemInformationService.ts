import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemInformationRepository } from '../repositories/ItemInformationRepository';
import { ItemInformation } from '../models/ItemInformation';
import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../requests/ItemInformationUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class ItemInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemInformationRepository) public itemInformationRepo: ItemInformationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemInformation>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemInformation>> {
        return this.itemInformationRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemInformation> {
        const itemInformation = await this.itemInformationRepo.findOne(id, withRelated);
        if (itemInformation === null) {
            this.log.warn(`ItemInformation with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemInformation;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.create({
            data: data.params[0] // TODO: convert your params to ItemInformationCreateRequest
        });
    }

    @validate()
    public async create( @request(ItemInformationCreateRequest) body: any): Promise<ItemInformation> {

        // TODO: extract and remove related models from request
        // const itemInformationRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the itemInformation
        const itemInformation = await this.itemInformationRepo.create(body);

        // TODO: create related models
        // itemInformationRelated._id = itemInformation.Id;
        // await this.itemInformationRelatedService.create(itemInformationRelated);

        // finally find and return the created itemInformation
        const newItemInformation = await this.findOne(itemInformation.id);
        return newItemInformation;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to ItemInformationUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(ItemInformationUpdateRequest) body: any): Promise<ItemInformation> {

        // find the existing one without related
        const itemInformation = await this.findOne(id, false);

        // set new values
        itemInformation.Title = body.title;
        itemInformation.ShortDescription = body.shortDescription;
        itemInformation.LongDescription = body.longDescription;

        // update itemInformation record
        const updatedItemInformation = await this.itemInformationRepo.update(id, itemInformation.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let itemInformationRelated = updatedItemInformation.related('ItemInformationRelated').toJSON();
        // await this.itemInformationService.destroy(itemInformationRelated.id);

        // TODO: recreate related data
        // itemInformationRelated = body.itemInformationRelated;
        // itemInformationRelated._id = itemInformation.Id;
        // const createdItemInformation = await this.itemInformationService.create(itemInformationRelated);

        // TODO: finally find and return the updated itemInformation
        // const newItemInformation = await this.findOne(id);
        // return newItemInformation;

        return updatedItemInformation;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.itemInformationRepo.destroy(id);
    }

}
