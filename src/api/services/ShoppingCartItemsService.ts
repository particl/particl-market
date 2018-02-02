import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ShoppingCartItemsRepository } from '../repositories/ShoppingCartItemsRepository';
import { ShoppingCartItems } from '../models/ShoppingCartItems';
import { ShoppingCartItemsCreateRequest } from '../requests/ShoppingCartItemsCreateRequest';
import { ShoppingCartItemsUpdateRequest } from '../requests/ShoppingCartItemsUpdateRequest';


export class ShoppingCartItemsService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ShoppingCartItemsRepository) public shoppingCartItemsRepo: ShoppingCartItemsRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShoppingCartItems>> {
        return this.shoppingCartItemsRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShoppingCartItems> {
        const shoppingCartItems = await this.shoppingCartItemsRepo.findOne(id, withRelated);
        if (shoppingCartItems === null) {
            this.log.warn(`ShoppingCartItems with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return shoppingCartItems;
    }

    @validate()
    public async create( @request(ShoppingCartItemsCreateRequest) body: any): Promise<ShoppingCartItems> {

        // TODO: extract and remove related models from request
        // const shoppingCartItemsRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the shoppingCartItems
        const shoppingCartItems = await this.shoppingCartItemsRepo.create(body);

        // TODO: create related models
        // shoppingCartItemsRelated._id = shoppingCartItems.Id;
        // await this.shoppingCartItemsRelatedService.create(shoppingCartItemsRelated);

        // finally find and return the created shoppingCartItems
        const newShoppingCartItems = await this.findOne(shoppingCartItems.id);
        return newShoppingCartItems;
    }

    @validate()
    public async update(id: number, @request(ShoppingCartItemsUpdateRequest) body: any): Promise<ShoppingCartItems> {

        // find the existing one without related
        const shoppingCartItems = await this.findOne(id, false);

        // set new values

        // update shoppingCartItems record
        const updatedShoppingCartItems = await this.shoppingCartItemsRepo.update(id, shoppingCartItems.toJSON());

        // TODO: find related record and update it

        // TODO: finally find and return the updated shoppingCartItems
        // const newShoppingCartItems = await this.findOne(id);
        // return newShoppingCartItems;

        return updatedShoppingCartItems;
    }

    public async destroy(id: number): Promise<void> {
        await this.shoppingCartItemsRepo.destroy(id);
    }

}
