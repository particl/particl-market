import { IsEnum, IsNotEmpty } from 'class-validator';
import { MessageBody } from '../../core/api/MessageBody';
import { ListingItemMessageInterface } from './ListingItemMessageInterface';

export class ListingItemMessage extends MessageBody implements ListingItemMessageInterface {

    @IsNotEmpty()
    public hash: string;

    @IsNotEmpty()
    public information: any;

    @IsNotEmpty()
    public payment: any;

    @IsNotEmpty()
    public messaging: any;

    public objects?: any;

}
