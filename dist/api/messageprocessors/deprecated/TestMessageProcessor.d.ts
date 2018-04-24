import { Logger as LoggerType } from '../../../core/Logger';
import { MessageProcessorInterface } from '../MessageProcessorInterface';
import { ActionMessageInterface } from '../../messages/ActionMessageInterface';
export declare class TestMessageProcessor implements MessageProcessorInterface {
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    process(message: ActionMessageInterface): Promise<void>;
}
