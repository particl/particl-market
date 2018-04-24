import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { FlaggedItemRepository } from '../repositories/FlaggedItemRepository';
import { FlaggedItem } from '../models/FlaggedItem';
export declare class FlaggedItemService {
    flaggedItemRepo: FlaggedItemRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(flaggedItemRepo: FlaggedItemRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<FlaggedItem>>;
    findOne(id: number, withRelated?: boolean): Promise<FlaggedItem>;
    create(body: any): Promise<FlaggedItem>;
    update(id: number, body: any): Promise<FlaggedItem>;
    destroy(id: number): Promise<void>;
}
