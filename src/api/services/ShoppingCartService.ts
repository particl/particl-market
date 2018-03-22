import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ShoppingCartRepository } from '../repositories/ShoppingCartRepository';
import { ShoppingCart } from '../models/ShoppingCart';
import { ShoppingCartCreateRequest } from '../requests/ShoppingCartCreateRequest';
import { ShoppingCartUpdateRequest } from '../requests/ShoppingCartUpdateRequest';


export class ShoppingCartService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ShoppingCartRepository) public shoppingCartRepo: ShoppingCartRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShoppingCart>> {
        return this.shoppingCartRepo.findAll();
    }

    public async findAllByProfile(searchParam: number): Promise<Bookshelf.Collection<ShoppingCart>> {
        return this.shoppingCartRepo.findAllByProfile(searchParam);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShoppingCart> {
        const shoppingCart = await this.shoppingCartRepo.findOne(id, withRelated);
        if (shoppingCart === null) {
            this.log.warn(`ShoppingCart with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return shoppingCart;
    }

    @validate()
    public async create( @request(ShoppingCartCreateRequest) body: any): Promise<ShoppingCart> {

        // If the request body was valid we will create the shoppingCart
        const shoppingCart = await this.shoppingCartRepo.create(body);

        // finally find and return the created shoppingCart
        const newShoppingCart = await this.findOne(shoppingCart.id);
        return newShoppingCart;
    }

    @validate()
    public async update(id: number, @request(ShoppingCartUpdateRequest) body: any): Promise<ShoppingCart> {

        const shoppingCart = await this.findOne(id, false);
        shoppingCart.Name = body.name;

        return await this.shoppingCartRepo.update(id, shoppingCart.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        await this.shoppingCartRepo.destroy(id);
    }

}
