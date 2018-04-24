import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { MessageDataRepository } from '../repositories/MessageDataRepository';
import { MessageData } from '../models/MessageData';
import { MessageDataCreateRequest } from '../requests/MessageDataCreateRequest';
import { MessageDataUpdateRequest } from '../requests/MessageDataUpdateRequest';
export declare class MessageDataService {
    messageDataRepo: MessageDataRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(messageDataRepo: MessageDataRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessageData>>;
    findOne(id: number, withRelated?: boolean): Promise<MessageData>;
    create(data: MessageDataCreateRequest): Promise<MessageData>;
    update(id: number, body: MessageDataUpdateRequest): Promise<MessageData>;
    destroy(id: number): Promise<void>;
}
