import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { MessageEscrowRepository } from '../repositories/MessageEscrowRepository';
import { MessageEscrow } from '../models/MessageEscrow';
import { MessageEscrowCreateRequest } from '../requests/MessageEscrowCreateRequest';
import { MessageEscrowUpdateRequest } from '../requests/MessageEscrowUpdateRequest';
export declare class MessageEscrowService {
    messageEscrowRepo: MessageEscrowRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(messageEscrowRepo: MessageEscrowRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessageEscrow>>;
    findOne(id: number, withRelated?: boolean): Promise<MessageEscrow>;
    create(data: MessageEscrowCreateRequest): Promise<MessageEscrow>;
    update(id: number, body: MessageEscrowUpdateRequest): Promise<MessageEscrow>;
    destroy(id: number): Promise<void>;
}
