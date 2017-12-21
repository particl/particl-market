import { IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './../ActionMessageInterface';


export class EscrowRefundMessage implements ActionMessageInterface {

    public action: string;
    public item: string;

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
