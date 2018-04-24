import * as Bookshelf from 'bookshelf';
import { MessageData } from '../models/MessageData';
import { Logger as LoggerType } from '../../core/Logger';
export declare class MessageDataRepository {
    MessageDataModel: typeof MessageData;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(MessageDataModel: typeof MessageData, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessageData>>;
    findOne(id: number, withRelated?: boolean): Promise<MessageData>;
    create(data: any): Promise<MessageData>;
    update(id: number, data: any): Promise<MessageData>;
    destroy(id: number): Promise<void>;
}
