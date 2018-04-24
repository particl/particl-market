import * as Bookshelf from 'bookshelf';
import { EscrowRatio } from '../models/EscrowRatio';
import { Logger as LoggerType } from '../../core/Logger';
export declare class EscrowRatioRepository {
    EscrowRatioModel: typeof EscrowRatio;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(EscrowRatioModel: typeof EscrowRatio, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<EscrowRatio>>;
    findOne(id: number, withRelated?: boolean): Promise<EscrowRatio>;
    create(data: any): Promise<EscrowRatio>;
    update(id: number, data: any): Promise<EscrowRatio>;
    destroy(id: number): Promise<void>;
}
