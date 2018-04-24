import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { ShoppingCartItemService } from '../../services/ShoppingCartItemService';
export declare class ShoppingCartClearCommand extends BaseCommand implements RpcCommandInterface<void> {
    private shoppingCartItemService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shoppingCartItemService: ShoppingCartItemService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: cartId
     *
     * @param data
     * @returns {Promise<any>}
     */
    execute(data: RpcRequest): Promise<any>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
