import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowActionService } from '../../services/EscrowActionService';
import { BaseCommand } from '../BaseCommand';
import { OrderItemService } from '../../services/OrderItemService';
export declare class EscrowRefundCommand extends BaseCommand implements RpcCommandInterface<Escrow> {
    Logger: typeof LoggerType;
    private escrowActionService;
    private orderItemService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, escrowActionService: EscrowActionService, orderItemService: OrderItemService);
    /**
     * data.params[]:
     * [0]: itemhash
     * [1]: accepted
     * [2]: memo
     * [3]: escrowId
     * @param data
     * @returns {Promise<any>}
     */
    execute(data: RpcRequest): Promise<any>;
    usage(): string;
    help(): string;
    description(): string;
}
