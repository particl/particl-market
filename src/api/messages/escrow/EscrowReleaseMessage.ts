import { IsNotEmpty } from 'class-validator';
import { GenerateMessageInterface } from './../GenerateMessageInterface';

export class EscrowReleaseMessage implements GenerateMessageInterface {

    @IsNotEmpty()
    public escrow: object;

    @IsNotEmpty()
    public listing: string;

    @IsNotEmpty()
    public memo: string;

    constructor() {
        //
    }
}
