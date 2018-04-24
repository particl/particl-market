import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { ShoppingCartService } from '../../services/ShoppingCartService';
import { ShoppingCart } from '../../models/ShoppingCart';
export declare class ShoppingCartGetCommand extends BaseCommand implements RpcCommandInterface<ShoppingCart> {
    private shoppingCartService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shoppingCartService: ShoppingCartService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: cartId
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    execute(data: RpcRequest): Promise<ShoppingCart>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
