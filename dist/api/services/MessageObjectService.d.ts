import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { MessageObjectRepository } from '../repositories/MessageObjectRepository';
import { MessageObject } from '../models/MessageObject';
import { MessageObjectCreateRequest } from '../requests/MessageObjectCreateRequest';
import { MessageObjectUpdateRequest } from '../requests/MessageObjectUpdateRequest';
export declare class MessageObjectService {
    messageObjectRepo: MessageObjectRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(messageObjectRepo: MessageObjectRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessageObject>>;
    findOne(id: number, withRelated?: boolean): Promise<MessageObject>;
    create(data: MessageObjectCreateRequest): Promise<MessageObject>;
    update(id: number, body: MessageObjectUpdateRequest): Promise<MessageObject>;
    destroy(id: number): Promise<void>;
}
