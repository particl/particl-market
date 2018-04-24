import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { EscrowRatioRepository } from '../repositories/EscrowRatioRepository';
import { EscrowRatio } from '../models/EscrowRatio';
import { EscrowRatioCreateRequest } from '../requests/EscrowRatioCreateRequest';
import { EscrowRatioUpdateRequest } from '../requests/EscrowRatioUpdateRequest';
export declare class EscrowRatioService {
    escrowRatioRepo: EscrowRatioRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(escrowRatioRepo: EscrowRatioRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<EscrowRatio>>;
    findOne(id: number, withRelated?: boolean): Promise<EscrowRatio>;
    create(body: EscrowRatioCreateRequest): Promise<EscrowRatio>;
    update(id: number, body: EscrowRatioUpdateRequest): Promise<EscrowRatio>;
    destroy(id: number): Promise<void>;
}
