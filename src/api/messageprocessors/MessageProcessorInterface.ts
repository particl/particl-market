import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { SmsgMessage } from '../messages/SmsgMessage';

export interface MessageProcessorInterface {
    process( message: ActionMessageInterface | ListingItemMessageInterface | SmsgMessage[], marketAddress: string): void;
}
