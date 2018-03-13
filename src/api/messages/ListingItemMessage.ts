import { IsEnum, IsNotEmpty } from 'class-validator';
import { MessageBody } from '../../core/api/MessageBody';
import { ListingItemMessageInterface } from './ListingItemMessageInterface';

export class ListingItemMessage extends MessageBody implements ListingItemMessageInterface {

    @IsNotEmpty()
    public hash: string;

    public information: any;
    public payment: any;
    public messaging: any;
    public objects: any;

}
