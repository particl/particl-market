import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageException } from '../exceptions/MessageException';
import { ShoppingCartItemRepository } from '../repositories/ShoppingCartItemRepository';
import { ShoppingCartItem } from '../models/ShoppingCartItem';
import { ShoppingCartItemCreateRequest } from '../requests/ShoppingCartItemCreateRequest';
import { ShoppingCartItemUpdateRequest } from '../requests/ShoppingCartItemUpdateRequest';


export class ShoppingCartItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ShoppingCartItemRepository) public shoppingCartItemRepo: ShoppingCartItemRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShoppingCartItem>> {
        return this.shoppingCartItemRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShoppingCartItem> {
        const shoppingCartItem = await this.shoppingCartItemRepo.findOne(id, withRelated);
        if (shoppingCartItem === null) {
            this.log.warn(`ShoppingCartItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return shoppingCartItem;
    }

    public async findOneByListingItemOnCart(cartId: number, listingItemId: number): Promise<ShoppingCartItem> {
        return await this.shoppingCartItemRepo.findOneByListingItemOnCart(cartId, listingItemId);
    }

    public async findListItemsByCartId(cartId: number): Promise<Bookshelf.Collection<ShoppingCartItem>> {
        return await this.shoppingCartItemRepo.findListItemsByCartId(cartId);
    }

    @validate()
    public async create( @request(ShoppingCartItemCreateRequest) body: any): Promise<ShoppingCartItem> {

        // check that listingItems already added or not
        const isItemExistOnCart = await this.findOneByListingItemOnCart(body.shopping_cart_id, body.listing_item_id);

        if (isItemExistOnCart !== null) {
            this.log.warn(`listing item already exist on shopping cart`);
            throw new MessageException(`listing item already exist on shopping cart`);
        }

        // If the request body was valid we will create the shoppingCartItem
        const shoppingCartItem = await this.shoppingCartItemRepo.create(body);

        // finally find and return the created shoppingCartItem
        const newShoppingCartItem = await this.findOne(shoppingCartItem.id);
        return newShoppingCartItem;
    }

    @validate()
    public async update(id: number, @request(ShoppingCartItemUpdateRequest) body: any): Promise<ShoppingCartItem> {

        // find the existing one without related
        const shoppingCartItem = await this.findOne(id, false);

        // set new values

        // update shoppingCartItem record
        const updatedShoppingCartItem = await this.shoppingCartItemRepo.update(id, shoppingCartItem.toJSON());

        // return newShoppingCartItem;

        return updatedShoppingCartItem;
    }

    public async destroy(id: number): Promise<void> {
        await this.shoppingCartItemRepo.destroy(id);
    }

    public async clearCart(cartId: number): Promise<void> {
        await this.shoppingCartItemRepo.clearCart(cartId);
    }

}
