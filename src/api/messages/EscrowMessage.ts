import { IsEnum, IsNotEmpty } from 'class-validator';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../core/api/MessageBody';

export class EscrowMessage extends MessageBody implements ActionMessageInterface {

    @IsNotEmpty()
    @IsEnum(EscrowMessageType)
    public action: EscrowMessageType;

    @IsNotEmpty()
    public item: string;    // using listing instead of item

    @IsNotEmpty()
    public escrow: any;

    public nonce?: string;
    public memo?: string;
    public info?: any;
    public accepted?: boolean;

}
