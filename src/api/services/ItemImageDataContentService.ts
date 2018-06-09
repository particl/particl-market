import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemImageDataContentRepository } from '../repositories/ItemImageDataContentRepository';
import { ItemImageDataContent } from '../models/ItemImageDataContent';
import { ItemImageDataContentCreateRequest } from '../requests/ItemImageDataContentCreateRequest';
import { ItemImageDataContentUpdateRequest } from '../requests/ItemImageDataContentUpdateRequest';


export class ItemImageDataContentService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemImageDataContentRepository) public itemImageDataContentRepo: ItemImageDataContentRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImageDataContent>> {
        return this.itemImageDataContentRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImageDataContent> {
        const itemImageDataContent = await this.itemImageDataContentRepo.findOne(id, withRelated);
        if (itemImageDataContent === null) {
            this.log.warn(`ItemImageDataContent with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemImageDataContent;
    }

    @validate()
    public async create( @request(ItemImageDataContentCreateRequest) data: ItemImageDataContentCreateRequest): Promise<ItemImageDataContent> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create ItemImageDataContent, body: ', JSON.stringify(body, null, 2));

        // TODO: extract and remove related models from request
        // const itemImageDataContentRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the itemImageDataContent
        const itemImageDataContent = await this.itemImageDataContentRepo.create(body);

        // TODO: create related models
        // itemImageDataContentRelated._id = itemImageDataContent.Id;
        // await this.itemImageDataContentRelatedService.create(itemImageDataContentRelated);

        // finally find and return the created itemImageDataContent
        const newItemImageDataContent = await this.findOne(itemImageDataContent.id);
        return newItemImageDataContent;
    }

    @validate()
    public async update(id: number, @request(ItemImageDataContentUpdateRequest) body: ItemImageDataContentUpdateRequest): Promise<ItemImageDataContent> {

        // find the existing one without related
        const itemImageDataContent = await this.findOne(id, false);

        // set new values
        itemImageDataContent.Data = body.data;

        // update itemImageDataContent record
        const updatedItemImageDataContent = await this.itemImageDataContentRepo.update(id, itemImageDataContent.toJSON());

        // const newItemImageDataContent = await this.findOne(id);
        // return newItemImageDataContent;

        return updatedItemImageDataContent;
    }

    public async destroy(id: number): Promise<void> {
        await this.itemImageDataContentRepo.destroy(id);
    }

}
