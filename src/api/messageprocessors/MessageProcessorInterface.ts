import { ActionMessageInterface } from '../messages/ActionMessageInterface';

export interface MessageProcessorInterface {
    process( message: ActionMessageInterface ): void;
}
