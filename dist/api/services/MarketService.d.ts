import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { MarketRepository } from '../repositories/MarketRepository';
import { Market } from '../models/Market';
import { MarketCreateRequest } from '../requests/MarketCreateRequest';
import { MarketUpdateRequest } from '../requests/MarketUpdateRequest';
export declare class MarketService {
    marketRepo: MarketRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(marketRepo: MarketRepository, Logger: typeof LoggerType);
    getDefault(withRelated?: boolean): Promise<Market>;
    findAll(): Promise<Bookshelf.Collection<Market>>;
    findOne(id: number, withRelated?: boolean): Promise<Market>;
    findByAddress(address: string, withRelated?: boolean): Promise<Market>;
    create(body: MarketCreateRequest): Promise<Market>;
    update(id: number, body: MarketUpdateRequest): Promise<Market>;
    destroy(id: number): Promise<void>;
}
