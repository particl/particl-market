import * as Bookshelf from 'bookshelf';
import { Escrow } from '../models/Escrow';
import { Logger as LoggerType } from '../../core/Logger';
export declare class EscrowRepository {
    EscrowModel: typeof Escrow;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(EscrowModel: typeof Escrow, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<Escrow>>;
    findOne(id: number, withRelated?: boolean): Promise<Escrow>;
    create(data: any): Promise<Escrow>;
    update(id: number, data: any): Promise<Escrow>;
    destroy(id: number): Promise<void>;
}
