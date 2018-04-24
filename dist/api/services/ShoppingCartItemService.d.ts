import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ShoppingCartItemRepository } from '../repositories/ShoppingCartItemRepository';
import { ShoppingCartItem } from '../models/ShoppingCartItem';
export declare class ShoppingCartItemService {
    shoppingCartItemRepo: ShoppingCartItemRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shoppingCartItemRepo: ShoppingCartItemRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ShoppingCartItem>>;
    findOne(id: number, withRelated?: boolean): Promise<ShoppingCartItem>;
    findOneByListingItemOnCart(cartId: number, listingItemId: number): Promise<ShoppingCartItem>;
    findListItemsByCartId(cartId: number): Promise<Bookshelf.Collection<ShoppingCartItem>>;
    create(body: any): Promise<ShoppingCartItem>;
    update(id: number, body: any): Promise<ShoppingCartItem>;
    destroy(id: number): Promise<void>;
    clearCart(cartId: number): Promise<void>;
}
