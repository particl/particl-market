import * as Bookshelf from 'bookshelf';
import { FlaggedItem } from '../models/FlaggedItem';
import { Logger as LoggerType } from '../../core/Logger';
export declare class FlaggedItemRepository {
    FlaggedItemModel: typeof FlaggedItem;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(FlaggedItemModel: typeof FlaggedItem, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<FlaggedItem>>;
    findOne(id: number, withRelated?: boolean): Promise<FlaggedItem>;
    create(data: any): Promise<FlaggedItem>;
    update(id: number, data: any): Promise<FlaggedItem>;
    destroy(id: number): Promise<void>;
}
