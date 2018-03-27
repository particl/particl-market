import { IsNotEmpty } from 'class-validator';
import { EscrowMessageInterface } from './EscrowMessageInterface';
import { EscrowMessageType } from '../enums/EscrowMessageType';

export class EscrowMessage implements EscrowMessageInterface {

    @IsNotEmpty()
    public action: EscrowMessageType;

    @IsNotEmpty()
    public item: string;    // using listing instead of item

    @IsNotEmpty()
    public escrow: any;

    public nonce?: string;
    public memo?: string;
    public info?: any;
    public accepted?: boolean;

    constructor() {
        //
    }
}
