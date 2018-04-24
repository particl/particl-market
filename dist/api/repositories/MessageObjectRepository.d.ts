import * as Bookshelf from 'bookshelf';
import { MessageObject } from '../models/MessageObject';
import { Logger as LoggerType } from '../../core/Logger';
export declare class MessageObjectRepository {
    MessageObjectModel: typeof MessageObject;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(MessageObjectModel: typeof MessageObject, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessageObject>>;
    findOne(id: number, withRelated?: boolean): Promise<MessageObject>;
    create(data: any): Promise<MessageObject>;
    update(id: number, data: any): Promise<MessageObject>;
    destroy(id: number): Promise<void>;
}
