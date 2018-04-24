import { Logger as LoggerType } from '../../core/Logger';
import * as resources from 'resources';
import { OrderCreateRequest } from '../requests/OrderCreateRequest';
export declare class OrderFactory {
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    /**
     * create a OrderCreateRequest
     *
     * @param {"resources".Bid} bid
     * @returns {Promise<OrderCreateRequest>}
     */
    getModelFromBid(bid: resources.Bid): Promise<OrderCreateRequest>;
    private getShippingAddress(bid);
    private getOrderItems(bid);
    private getOrderItemObjects(bidDatas);
}
