import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { MessageInfoRepository } from '../repositories/MessageInfoRepository';
import { MessageInfo } from '../models/MessageInfo';
import { MessageInfoCreateRequest } from '../requests/MessageInfoCreateRequest';
import { MessageInfoUpdateRequest } from '../requests/MessageInfoUpdateRequest';
export declare class MessageInfoService {
    messageInfoRepo: MessageInfoRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(messageInfoRepo: MessageInfoRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessageInfo>>;
    findOne(id: number, withRelated?: boolean): Promise<MessageInfo>;
    create(data: MessageInfoCreateRequest): Promise<MessageInfo>;
    update(id: number, body: MessageInfoUpdateRequest): Promise<MessageInfo>;
    destroy(id: number): Promise<void>;
}
