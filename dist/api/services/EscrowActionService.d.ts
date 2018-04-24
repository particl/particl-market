/// <reference types="node" />
import { Logger as LoggerType } from '../../core/Logger';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { EventEmitter } from 'events';
import { ActionMessageService } from './ActionMessageService';
import { EscrowService } from './EscrowService';
import { ListingItemService } from './ListingItemService';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { OrderFactory } from '../factories/OrderFactory';
import { OrderService } from './OrderService';
import { SmsgService } from './SmsgService';
import { CoreRpcService } from './CoreRpcService';
import { EscrowFactory } from '../factories/EscrowFactory';
import { EscrowRequest } from '../requests/EscrowRequest';
import { OrderItemObjectService } from './OrderItemObjectService';
import { OrderItemService } from './OrderItemService';
export declare class EscrowActionService {
    actionMessageService: ActionMessageService;
    escrowService: EscrowService;
    listingItemService: ListingItemService;
    smsgService: SmsgService;
    orderService: OrderService;
    orderItemService: OrderItemService;
    orderItemObjectService: OrderItemObjectService;
    private coreRpcService;
    private escrowFactory;
    private orderFactory;
    eventEmitter: EventEmitter;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(actionMessageService: ActionMessageService, escrowService: EscrowService, listingItemService: ListingItemService, smsgService: SmsgService, orderService: OrderService, orderItemService: OrderItemService, orderItemObjectService: OrderItemObjectService, coreRpcService: CoreRpcService, escrowFactory: EscrowFactory, orderFactory: OrderFactory, eventEmitter: EventEmitter, Logger: typeof LoggerType);
    /**
     * Send the lock message for the given OrderItem
     *
     * @param {"resources".OrderItem} orderItem
     * @returns {Promise<SmsgSendResponse>}
     */
    lock(escrowRequest: EscrowRequest): Promise<SmsgSendResponse>;
    refund(escrowRequest: EscrowRequest): Promise<SmsgSendResponse>;
    release(escrowRequest: EscrowRequest): Promise<SmsgSendResponse>;
    /**
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<"resources".ActionMessage>}
     */
    processLockEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.Order>;
    processReleaseEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.Order>;
    processRequestRefundEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage>;
    processRefundEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage>;
    /**
     * Creates rawtx based on params
     *
     * @param request
     * @param escrow
     * @returns {string}
     */
    createRawTx(request: EscrowRequest, testRun?: boolean): Promise<string>;
    private configureEventListeners();
    private signRawTx(rawtx, shouldBeComplete?);
    /**
     *
     * @param {string} key
     * @param {"resources".OrderItemObject[]} orderItemObjects
     * @returns {any}
     */
    private getValueFromOrderItemObjects(key, orderItemObjects);
    private updateRawTxOrderItemObject(orderItemObjects, newRawtx);
    private updateOrderItemStatus(orderItem, newOrderStatus);
}
