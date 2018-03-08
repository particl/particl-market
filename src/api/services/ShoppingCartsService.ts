import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ShoppingCartsRepository } from '../repositories/ShoppingCartsRepository';
import { ShoppingCarts } from '../models/ShoppingCarts';
import { ShoppingCartsCreateRequest } from '../requests/ShoppingCartsCreateRequest';
import { ShoppingCartsUpdateRequest } from '../requests/ShoppingCartsUpdateRequest';


export class ShoppingCartsService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ShoppingCartsRepository) public shoppingCartsRepo: ShoppingCartsRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShoppingCarts>> {
        return this.shoppingCartsRepo.findAll();
    }

    public async findAllByProfile(searchParam: number | string): Promise<Bookshelf.Collection<ShoppingCarts>> {
        return this.shoppingCartsRepo.findAllByProfile(searchParam);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShoppingCarts> {
        const shoppingCarts = await this.shoppingCartsRepo.findOne(id, withRelated);
        if (shoppingCarts === null) {
            this.log.warn(`ShoppingCarts with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return shoppingCarts;
    }

    @validate()
    public async create( @request(ShoppingCartsCreateRequest) body: any): Promise<ShoppingCarts> {

        // If the request body was valid we will create the shoppingCarts
        const shoppingCarts = await this.shoppingCartsRepo.create(body);

        // finally find and return the created shoppingCarts
        const newShoppingCarts = await this.findOne(shoppingCarts.id);
        return newShoppingCarts;
    }

    @validate()
    public async update(id: number, @request(ShoppingCartsUpdateRequest) body: any): Promise<ShoppingCarts> {

        const shoppingCarts = await this.findOne(id, false);
        shoppingCarts.Name = body.name;

        return await this.shoppingCartsRepo.update(id, shoppingCarts.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        await this.shoppingCartsRepo.destroy(id);
    }

}
