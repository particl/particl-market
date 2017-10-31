import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemPriceRepository } from '../repositories/ItemPriceRepository';
import { ItemPrice } from '../models/ItemPrice';
import { ItemPriceCreateRequest } from '../requests/ItemPriceCreateRequest';
import { ItemPriceUpdateRequest } from '../requests/ItemPriceUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class ItemPriceService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemPriceRepository) public itemPriceRepo: ItemPriceRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemPrice>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemPrice>> {
        return this.itemPriceRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemPrice> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemPrice> {
        const itemPrice = await this.itemPriceRepo.findOne(id, withRelated);
        if (itemPrice === null) {
            this.log.warn(`ItemPrice with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemPrice;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemPrice> {
        return this.create({
            data: data.params[0] // TODO: convert your params to ItemPriceCreateRequest
        });
    }

    @validate()
    public async create( @request(ItemPriceCreateRequest) body: any): Promise<ItemPrice> {

        // TODO: extract and remove related models from request
        // const itemPriceRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the itemPrice
        const itemPrice = await this.itemPriceRepo.create(body);

        // TODO: create related models
        // itemPriceRelated._id = itemPrice.Id;
        // await this.itemPriceRelatedService.create(itemPriceRelated);

        // finally find and return the created itemPrice
        const newItemPrice = await this.findOne(itemPrice.id);
        return newItemPrice;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemPrice> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to ItemPriceUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(ItemPriceUpdateRequest) body: any): Promise<ItemPrice> {

        // find the existing one without related
        const itemPrice = await this.findOne(id, false);

        // set new values
        itemPrice.Currency = body.currency;
        itemPrice.BasePrice = body.basePrice;

        // update itemPrice record
        const updatedItemPrice = await this.itemPriceRepo.update(id, itemPrice.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let itemPriceRelated = updatedItemPrice.related('ItemPriceRelated').toJSON();
        // await this.itemPriceService.destroy(itemPriceRelated.id);

        // TODO: recreate related data
        // itemPriceRelated = body.itemPriceRelated;
        // itemPriceRelated._id = itemPrice.Id;
        // const createdItemPrice = await this.itemPriceService.create(itemPriceRelated);

        // TODO: finally find and return the updated itemPrice
        // const newItemPrice = await this.findOne(id);
        // return newItemPrice;

        return updatedItemPrice;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.itemPriceRepo.destroy(id);
    }

}
