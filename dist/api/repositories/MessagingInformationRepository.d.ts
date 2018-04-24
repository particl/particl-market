import * as Bookshelf from 'bookshelf';
import { MessagingInformation } from '../models/MessagingInformation';
import { Logger as LoggerType } from '../../core/Logger';
export declare class MessagingInformationRepository {
    MessagingInformationModel: typeof MessagingInformation;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(MessagingInformationModel: typeof MessagingInformation, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessagingInformation>>;
    findOne(id: number, withRelated?: boolean): Promise<MessagingInformation>;
    create(data: any): Promise<MessagingInformation>;
    update(id: number, data: any): Promise<MessagingInformation>;
    destroy(id: number): Promise<void>;
}
