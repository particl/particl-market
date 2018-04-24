import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { ShoppingCart } from '../../models/ShoppingCart';
import { ShoppingCartService } from '../../services/ShoppingCartService';
export declare class ShoppingCartAddCommand extends BaseCommand implements RpcCommandInterface<ShoppingCart> {
    private shoppingCartService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shoppingCartService: ShoppingCartService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: name
     *  [1]: profileId
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
