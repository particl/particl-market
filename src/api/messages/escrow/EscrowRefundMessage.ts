import { IsNotEmpty } from 'class-validator';
import { GenerateMessageInterface } from './../GenerateMessageInterface';

export class EscrowRefundMessage implements GenerateMessageInterface {

    @IsNotEmpty()
    public escrow: object;

    @IsNotEmpty()
    public listing: string;

    @IsNotEmpty()
    public memo: string;

    @IsNotEmpty()
    public accepted: boolean;

    constructor() {
        //
    }
}
