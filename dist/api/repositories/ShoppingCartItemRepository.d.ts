import * as Bookshelf from 'bookshelf';
import { ShoppingCartItem } from '../models/ShoppingCartItem';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ShoppingCartItemRepository {
    ShoppingCartItemModel: typeof ShoppingCartItem;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ShoppingCartItemModel: typeof ShoppingCartItem, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ShoppingCartItem>>;
    findOne(id: number, withRelated?: boolean): Promise<ShoppingCartItem>;
    findOneByListingItemOnCart(cartId: number, listingItemId: number): Promise<ShoppingCartItem>;
    findListItemsByCartId(cartId: number): Promise<Bookshelf.Collection<ShoppingCartItem>>;
    create(data: any): Promise<ShoppingCartItem>;
    update(id: number, data: any): Promise<ShoppingCartItem>;
    destroy(id: number): Promise<void>;
    clearCart(cartId: number): Promise<void>;
}
