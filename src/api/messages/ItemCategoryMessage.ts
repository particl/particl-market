import { IsEnum, IsNotEmpty } from 'class-validator';
import { MessageBody } from '../../core/api/MessageBody';

export class ItemCategoryMessage extends MessageBody {

    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public parentItemCategoryId: number;

}
