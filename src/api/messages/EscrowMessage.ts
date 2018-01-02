import { IsNotEmpty } from 'class-validator';
import { EscrowMessageInterface } from './EscrowMessageInterface';

export class EscrowMessage implements EscrowMessageInterface {

    @IsNotEmpty()
    public action: string;

    @IsNotEmpty()
    public item: string;    // listing

    @IsNotEmpty()
    public escrow: object;
    public nonce?: string;
    public memo?: string;
    public accepted?: boolean;

    constructor() {
        //
    }
}
