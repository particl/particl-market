import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { ProposalMessageInterface } from '../messages/ProposalMessageInterface';
import { SmsgMessage } from '../messages/SmsgMessage';
import { VoteMessageInterface } from '../messages/VoteMessageInterface';

export interface MessageProcessorInterface {
    process( message: ActionMessageInterface | ListingItemMessageInterface | ProposalMessageInterface | VoteMessageInterface | SmsgMessage[],
             marketAddress: string): any;
}
