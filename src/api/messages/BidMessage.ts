import { IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';

export class BidMessage implements ActionMessageInterface {

    @IsNotEmpty()
    public action: string;

    @IsNotEmpty()
    public item: string;

    constructor() {
        //
    }

}
