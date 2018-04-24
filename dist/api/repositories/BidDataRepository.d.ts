import * as Bookshelf from 'bookshelf';
import { BidData } from '../models/BidData';
import { Logger as LoggerType } from '../../core/Logger';
export declare class BidDataRepository {
    BidDataModel: typeof BidData;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(BidDataModel: typeof BidData, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<BidData>>;
    findOne(id: number, withRelated?: boolean): Promise<BidData>;
    create(data: any): Promise<BidData>;
    update(id: number, data: any): Promise<BidData>;
    destroy(id: number): Promise<void>;
}
