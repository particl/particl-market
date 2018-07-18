import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { VoteMessageType } from '../enums/VoteMessageType';
import { MessageBody } from '../../core/api/MessageBody';

export class VoteMessage extends MessageBody implements ActionMessageInterface {

    // @IsNotEmpty()
    // @IsEnum(VoteMessageType)
    public action: VoteMessageType;

    @IsNotEmpty()
    public item: string;

    // todo: objects
    public objects?: any[];

}
