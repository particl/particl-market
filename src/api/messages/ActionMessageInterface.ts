import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';

export interface ActionMessageInterface {
    action: EscrowMessageType | BidMessageType;
    item: string;
    objects?: any;
}
