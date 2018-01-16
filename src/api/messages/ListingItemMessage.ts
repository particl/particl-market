import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { BidMessageType } from '../enums/BidMessageType';
import { MessageBody } from '../../core/api/MessageBody';
import { ItemMessageInterface } from './ItemMessageInterface';

export class ListingItemMessage extends MessageBody implements ItemMessageInterface {

    @IsNotEmpty()
    public hash: string;

    @IsNotEmpty()
    public marketId: number;

    public listingItemTemplateId: number;
    public information: any;
    public payment: any;
    public messaging: any;

}
