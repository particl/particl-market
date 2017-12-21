import { IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';

export class EscrowMessage implements ActionMessageInterface {

    @IsNotEmpty()
    public action: string;

    public item: string;

    @IsNotEmpty()
    public escrow: object;

    public address?: object;

    @IsNotEmpty()
    public listing: string;

    public nonce?: string;

    @IsNotEmpty()
    public memo: string;

    public accepted?: boolean;

    constructor() {
        //
    }
}
