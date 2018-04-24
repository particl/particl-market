import * as Bookshelf from 'bookshelf';
import { ShoppingCart } from '../models/ShoppingCart';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ShoppingCartRepository {
    ShoppingCartModel: typeof ShoppingCart;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ShoppingCartModel: typeof ShoppingCart, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ShoppingCart>>;
    findAllByProfile(searchParam: number): Promise<Bookshelf.Collection<ShoppingCart>>;
    findOne(id: number, withRelated?: boolean): Promise<ShoppingCart>;
    create(data: any): Promise<ShoppingCart>;
    update(id: number, data: any): Promise<ShoppingCart>;
    destroy(id: number): Promise<void>;
}
