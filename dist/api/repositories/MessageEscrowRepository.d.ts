import * as Bookshelf from 'bookshelf';
import { MessageEscrow } from '../models/MessageEscrow';
import { Logger as LoggerType } from '../../core/Logger';
export declare class MessageEscrowRepository {
    MessageEscrowModel: typeof MessageEscrow;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(MessageEscrowModel: typeof MessageEscrow, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessageEscrow>>;
    findOne(id: number, withRelated?: boolean): Promise<MessageEscrow>;
    create(data: any): Promise<MessageEscrow>;
    update(id: number, data: any): Promise<MessageEscrow>;
    destroy(id: number): Promise<void>;
}
