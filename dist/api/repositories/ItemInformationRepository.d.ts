import * as Bookshelf from 'bookshelf';
import { ItemInformation } from '../models/ItemInformation';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ItemInformationRepository {
    ItemInformationModel: typeof ItemInformation;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ItemInformationModel: typeof ItemInformation, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemInformation>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemInformation>;
    findByItemTemplateId(listingItemTemplateId: number, withRelated?: boolean): Promise<ItemInformation>;
    create(data: any): Promise<ItemInformation>;
    update(id: number, data: any): Promise<ItemInformation>;
    destroy(id: number): Promise<void>;
}
