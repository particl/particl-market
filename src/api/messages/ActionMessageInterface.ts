import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';

export interface ActionMessageInterface {
    action: EscrowMessageType | BidMessageType | ListingItemMessageType | ProposalMessageType | VoteMessageType;
    item: string;
    objects?: any;
}
