import * as Bookshelf from 'bookshelf';
import { MessageInfo } from '../models/MessageInfo';
import { Logger as LoggerType } from '../../core/Logger';
export declare class MessageInfoRepository {
    MessageInfoModel: typeof MessageInfo;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(MessageInfoModel: typeof MessageInfo, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessageInfo>>;
    findOne(id: number, withRelated?: boolean): Promise<MessageInfo>;
    create(data: any): Promise<MessageInfo>;
    update(id: number, data: any): Promise<MessageInfo>;
    destroy(id: number): Promise<void>;
}
