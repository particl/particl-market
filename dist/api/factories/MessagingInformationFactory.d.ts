import { Logger as LoggerType } from '../../core/Logger';
import { MessagingInformation } from '../models/MessagingInformation';
export declare class MessagingInformationFactory {
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    get(message: string[]): Promise<MessagingInformation>;
}
