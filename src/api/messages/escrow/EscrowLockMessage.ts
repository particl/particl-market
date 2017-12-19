import { IsNotEmpty } from 'class-validator';
import { GenerateMessageInterface } from './../GenerateMessageInterface';

export class EscrowLockMessage implements GenerateMessageInterface {

    @IsNotEmpty()
    public escrow: object;

    @IsNotEmpty()
    public address: object;

    @IsNotEmpty()
    public listing: string;

    @IsNotEmpty()
    public nonce: string;

    @IsNotEmpty()
    public memo: string;

    constructor() {
        //
    }
}
