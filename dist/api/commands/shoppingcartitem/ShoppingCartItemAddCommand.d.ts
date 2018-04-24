import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { ShoppingCartItem } from '../../models/ShoppingCartItem';
import { ShoppingCartItemService } from '../../services/ShoppingCartItemService';
import { ListingItemService } from '../../services/ListingItemService';
export declare class ShoppingCartItemAddCommand extends BaseCommand implements RpcCommandInterface<ShoppingCartItem> {
    private shoppingCartItemService;
    private listingItemService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shoppingCartItemService: ShoppingCartItemService, listingItemService: ListingItemService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: cartId
     *  [1]: itemId | hash
     *
     * @param data
     * @returns {Promise<ShoppingCartItem>}
     */
    execute(data: RpcRequest): Promise<ShoppingCartItem>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
