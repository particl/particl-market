import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../core/api/MessageBody';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';

export class ListingItemAddMessage extends MessageBody implements ActionMessageInterface {

    @IsNotEmpty()
    @IsEnum(ListingItemMessageType)
    public action: ListingItemMessageType;

    @IsNotEmpty()
    public item: string;

    public objects: any;

}
