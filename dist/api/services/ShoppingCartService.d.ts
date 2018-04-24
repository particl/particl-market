import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ShoppingCartRepository } from '../repositories/ShoppingCartRepository';
import { ShoppingCart } from '../models/ShoppingCart';
export declare class ShoppingCartService {
    shoppingCartRepo: ShoppingCartRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shoppingCartRepo: ShoppingCartRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ShoppingCart>>;
    findAllByProfile(searchParam: number): Promise<Bookshelf.Collection<ShoppingCart>>;
    findOne(id: number, withRelated?: boolean): Promise<ShoppingCart>;
    create(body: any): Promise<ShoppingCart>;
    update(id: number, body: any): Promise<ShoppingCart>;
    destroy(id: number): Promise<void>;
}
