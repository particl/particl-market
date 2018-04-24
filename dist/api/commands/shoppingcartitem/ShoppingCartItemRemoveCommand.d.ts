import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { ShoppingCartItemService } from '../../services/ShoppingCartItemService';
import { ListingItemService } from '../../services/ListingItemService';
export declare class ShoppingCartItemRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
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
     * @returns {Promise<void>}
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
