import * as Bookshelf from 'bookshelf';
import { Market } from '../models/Market';
import { Logger as LoggerType } from '../../core/Logger';
export declare class MarketRepository {
    MarketModel: typeof Market;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(MarketModel: typeof Market, Logger: typeof LoggerType);
    getDefault(withRelated?: boolean): Promise<Market>;
    findAll(): Promise<Bookshelf.Collection<Market>>;
    findOne(id: number, withRelated?: boolean): Promise<Market>;
    findOneByAddress(address: string, withRelated?: boolean): Promise<Market>;
    findOneByName(name: string, withRelated?: boolean): Promise<Market>;
    create(data: any): Promise<Market>;
    update(id: number, data: any): Promise<Market>;
    destroy(id: number): Promise<void>;
}
