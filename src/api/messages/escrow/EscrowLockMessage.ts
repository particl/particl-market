import { IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './../ActionMessageInterface';

export class EscrowLockMessage implements ActionMessageInterface {

    public action: string;
    public item: string;

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
