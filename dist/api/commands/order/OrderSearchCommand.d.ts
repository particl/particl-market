import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { OrderService } from '../../services/OrderService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { Order } from '../../models/Order';
export declare class OrderSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Order>> {
    Logger: typeof LoggerType;
    private orderService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, orderService: OrderService);
    /**
     * data.params[]:
     * [0]: <itemhash>|*
     * [1]: (<status>|*)
     * [2]: (<buyerAddress>|*)
     * [3]: (<sellerAddress>|*)
     * [4]: <ordering>
     * @param {RpcRequest} data
     * @returns {Promise<Bookshelf.Collection<Order>>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<Order>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
