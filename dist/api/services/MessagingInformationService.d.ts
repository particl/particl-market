import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { MessagingInformationRepository } from '../repositories/MessagingInformationRepository';
import { MessagingInformation } from '../models/MessagingInformation';
import { MessagingInformationCreateRequest } from '../requests/MessagingInformationCreateRequest';
import { MessagingInformationUpdateRequest } from '../requests/MessagingInformationUpdateRequest';
export declare class MessagingInformationService {
    messagingInformationRepo: MessagingInformationRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(messagingInformationRepo: MessagingInformationRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<MessagingInformation>>;
    findOne(id: number, withRelated?: boolean): Promise<MessagingInformation>;
    create(body: MessagingInformationCreateRequest): Promise<MessagingInformation>;
    update(id: number, body: MessagingInformationUpdateRequest): Promise<MessagingInformation>;
    destroy(id: number): Promise<void>;
}
