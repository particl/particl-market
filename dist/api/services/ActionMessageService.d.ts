import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ActionMessageRepository } from '../repositories/ActionMessageRepository';
import { ActionMessage } from '../models/ActionMessage';
import { ActionMessageCreateRequest } from '../requests/ActionMessageCreateRequest';
import { ActionMessageUpdateRequest } from '../requests/ActionMessageUpdateRequest';
import { MessageInfoService } from './MessageInfoService';
import { MessageEscrowService } from './MessageEscrowService';
import { MessageDataService } from './MessageDataService';
import { MessageObjectService } from './MessageObjectService';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { MarketService } from './MarketService';
import { ActionMessageFactory } from '../factories/ActionMessageFactory';
import * as resources from 'resources';
export declare class ActionMessageService {
    private messageInfoService;
    private messageEscrowService;
    private messageDataService;
    private messageObjectService;
    marketService: MarketService;
    private actionMessageFactory;
    actionMessageRepo: ActionMessageRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(messageInfoService: MessageInfoService, messageEscrowService: MessageEscrowService, messageDataService: MessageDataService, messageObjectService: MessageObjectService, marketService: MarketService, actionMessageFactory: ActionMessageFactory, actionMessageRepo: ActionMessageRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ActionMessage>>;
    findOne(id: number, withRelated?: boolean): Promise<ActionMessage>;
    create(data: ActionMessageCreateRequest): Promise<ActionMessage>;
    /**
     * save the received ActionMessage to the database
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<ActionMessage>}
     */
    createFromMarketplaceEvent(event: MarketplaceEvent, listingItem: resources.ListingItem): Promise<ActionMessage>;
    update(id: number, body: ActionMessageUpdateRequest): Promise<ActionMessage>;
    destroy(id: number): Promise<void>;
}
