import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { BidDataRepository } from '../repositories/BidDataRepository';
import { BidData } from '../models/BidData';
import { BidDataCreateRequest } from '../requests/BidDataCreateRequest';
import { BidDataUpdateRequest } from '../requests/BidDataUpdateRequest';
export declare class BidDataService {
    bidDataRepo: BidDataRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(bidDataRepo: BidDataRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<BidData>>;
    findOne(id: number, withRelated?: boolean): Promise<BidData>;
    create(data: BidDataCreateRequest): Promise<BidData>;
    update(id: number, body: BidDataUpdateRequest): Promise<BidData>;
    destroy(id: number): Promise<void>;
}
