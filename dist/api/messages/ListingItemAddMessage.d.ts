import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../core/api/MessageBody';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
export declare class ListingItemAddMessage extends MessageBody implements ActionMessageInterface {
    action: ListingItemMessageType;
    item: string;
    objects: any;
}
