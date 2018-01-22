import { IsEnum, IsNotEmpty } from 'class-validator';
import { MessageBody } from '../../core/api/MessageBody';
import { ItemMessageInterface } from './ItemMessageInterface';

export class ListingItemMessage extends MessageBody implements ItemMessageInterface {

    @IsNotEmpty()
    public hash: string;

    public information: any;
    public payment: any;
    public messaging: any;
    public objects: any;

}
