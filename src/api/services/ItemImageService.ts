import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemImageRepository } from '../repositories/ItemImageRepository';
import { ItemImage } from '../models/ItemImage';
import { ItemImageCreateRequest } from '../requests/ItemImageCreateRequest';
import { ItemImageUpdateRequest } from '../requests/ItemImageUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class ItemImageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemImageRepository) public itemImageRepo: ItemImageRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemImage>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImage>> {
        return this.itemImageRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemImage> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImage> {
        const itemImage = await this.itemImageRepo.findOne(id, withRelated);
        if (itemImage === null) {
            this.log.warn(`ItemImage with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemImage;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemImage> {
        return this.create({
            data: data.params[0] // TODO: convert your params to ItemImageCreateRequest
        });
    }

    @validate()
    public async create( @request(ItemImageCreateRequest) body: any): Promise<ItemImage> {

        // TODO: extract and remove related models from request
        // const itemImageRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the itemImage
        const itemImage = await this.itemImageRepo.create(body);

        // TODO: create related models
        // itemImageRelated._id = itemImage.Id;
        // await this.itemImageRelatedService.create(itemImageRelated);

        // finally find and return the created itemImage
        const newItemImage = await this.findOne(itemImage.id);
        return newItemImage;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemImage> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to ItemImageUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(ItemImageUpdateRequest) body: any): Promise<ItemImage> {

        // find the existing one without related
        const itemImage = await this.findOne(id, false);

        // set new values
        itemImage.Hash = body.hash;

        // update itemImage record
        const updatedItemImage = await this.itemImageRepo.update(id, itemImage.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let itemImageRelated = updatedItemImage.related('ItemImageRelated').toJSON();
        // await this.itemImageService.destroy(itemImageRelated.id);

        // TODO: recreate related data
        // itemImageRelated = body.itemImageRelated;
        // itemImageRelated._id = itemImage.Id;
        // const createdItemImage = await this.itemImageService.create(itemImageRelated);

        // TODO: finally find and return the updated itemImage
        // const newItemImage = await this.findOne(id);
        // return newItemImage;

        return updatedItemImage;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.itemImageRepo.destroy(id);
    }

}
