import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ProposalMessageType } from '../enums/ProposalMessageType';

export interface ActionMessageInterface {
    action: EscrowMessageType | BidMessageType | ListingItemMessageType | ProposalMessageType;
    item: string;
    objects?: any;
}
