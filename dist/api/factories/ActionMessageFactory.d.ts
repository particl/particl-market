import { Logger as LoggerType } from '../../core/Logger';
import { ActionMessageCreateRequest } from '../requests/ActionMessageCreateRequest';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { SmsgMessage } from '../messages/SmsgMessage';
export declare class ActionMessageFactory {
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    getModel(message: ActionMessageInterface, listingItemId: number, smsgMessage: SmsgMessage): Promise<ActionMessageCreateRequest>;
    private getModelMessageObjects(bidMessage);
    private getModelMessageData(smsgMessage);
}
