import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
export interface ActionMessageInterface {
    action: EscrowMessageType | BidMessageType | ListingItemMessageType;
    item: string;
    objects?: any;
}
