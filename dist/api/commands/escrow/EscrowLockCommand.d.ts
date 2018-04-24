import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowActionService } from '../../services/EscrowActionService';
import { OrderItemService } from '../../services/OrderItemService';
import { BaseCommand } from '../BaseCommand';
export declare class EscrowLockCommand extends BaseCommand implements RpcCommandInterface<Escrow> {
    Logger: typeof LoggerType;
    private escrowActionService;
    private orderItemService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, escrowActionService: EscrowActionService, orderItemService: OrderItemService);
    /**
     * data.params[]:
     * [0]: orderItemId
     * [1]: nonce
     * [2]: memo
     *
     * @param data
     * @returns {Promise<any>}
     */
    execute(data: RpcRequest): Promise<any>;
    usage(): string;
    help(): string;
    description(): string;
}
