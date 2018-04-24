import * as Bookshelf from 'bookshelf';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { ShoppingCartItem } from '../../models/ShoppingCartItem';
import { ShoppingCartItemService } from '../../services/ShoppingCartItemService';
export declare class ShoppingCartItemListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ShoppingCartItem>> {
    private shoppingCartItemService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shoppingCartItemService: ShoppingCartItemService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: cartId, number
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<ShoppingCartItem>>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<ShoppingCartItem>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
