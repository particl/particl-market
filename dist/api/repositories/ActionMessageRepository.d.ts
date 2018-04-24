import * as Bookshelf from 'bookshelf';
import { ActionMessage } from '../models/ActionMessage';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ActionMessageRepository {
    ActionMessageModel: typeof ActionMessage;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ActionMessageModel: typeof ActionMessage, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ActionMessage>>;
    findOne(id: number, withRelated?: boolean): Promise<ActionMessage>;
    create(data: any): Promise<ActionMessage>;
    update(id: number, data: any): Promise<ActionMessage>;
    destroy(id: number): Promise<void>;
}
