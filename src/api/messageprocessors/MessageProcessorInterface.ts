import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ItemMessageInterface } from '../messages/ItemMessageInterface';
import { SmsgMessage } from '../messages/SmsgMessage';

export interface MessageProcessorInterface {
    process( message: ActionMessageInterface | ItemMessageInterface | SmsgMessage[]): void;
}
