import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { ProposalMessageInterface } from '../messages/ProposalMessageInterface';
import { SmsgMessage } from '../messages/SmsgMessage';

export interface MessageProcessorInterface {
    process( message: ActionMessageInterface | ListingItemMessageInterface | ProposalMessageInterface | SmsgMessage[], marketAddress: string): any;
}
