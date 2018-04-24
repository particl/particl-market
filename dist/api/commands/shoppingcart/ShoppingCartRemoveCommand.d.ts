import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { ShoppingCartService } from '../../services/ShoppingCartService';
export declare class ShoppingCartRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    private shoppingCartService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shoppingCartService: ShoppingCartService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: cartId
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
