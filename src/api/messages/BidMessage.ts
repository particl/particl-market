import { IsNotEmpty } from 'class-validator';

export class BidMessage implements ActionMessage {

    @IsNotEmpty()
    public action: string;

    @IsNotEmpty()
    public item: string;

    constructor() {
        //
    }

}
