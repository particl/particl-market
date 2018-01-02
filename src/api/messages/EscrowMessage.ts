import { IsNotEmpty } from 'class-validator';
import { EscrowMessageInterface } from './EscrowMessageInterface';

export class EscrowMessage implements EscrowMessageInterface {

    @IsNotEmpty()
    public action: string;

    @IsNotEmpty()
    public listing: string;    // using listing instead of item

    @IsNotEmpty()
    public escrow: object;

    public nonce?: string;
    public memo?: string;
    public info?: any;
    public accepted?: boolean;


    constructor() {
        //
    }
}
