import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ItemMessageInterface } from '../messages/ItemMessageInterface';

export interface MessageProcessorInterface {
    process( message: ActionMessageInterface | ItemMessageInterface ): void;
}
