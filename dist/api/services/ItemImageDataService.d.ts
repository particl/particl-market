import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ItemImageDataRepository } from '../repositories/ItemImageDataRepository';
import { ItemImageData } from '../models/ItemImageData';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
export declare class ItemImageDataService {
    itemImageDataRepo: ItemImageDataRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(itemImageDataRepo: ItemImageDataRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemImageData>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemImageData>;
    create(body: ItemImageDataCreateRequest): Promise<ItemImageData>;
    update(id: number, body: ItemImageDataCreateRequest): Promise<ItemImageData>;
    destroy(id: number): Promise<void>;
}
