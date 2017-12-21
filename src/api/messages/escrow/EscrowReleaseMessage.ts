import { IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './../ActionMessageInterface';

export class EscrowReleaseMessage implements ActionMessageInterface {

    public action: string;
    public item: string;

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
