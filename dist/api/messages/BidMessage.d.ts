import { ActionMessageInterface } from './ActionMessageInterface';
import { BidMessageType } from '../enums/BidMessageType';
import { MessageBody } from '../../core/api/MessageBody';
export declare class BidMessage extends MessageBody implements ActionMessageInterface {
    action: BidMessageType;
    item: string;
    objects?: any[];
}
