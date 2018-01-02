import { IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { BidMessageType } from '../enums/BidMessageType';

export class BidMessage implements ActionMessageInterface {

    @IsNotEmpty()
    public action: BidMessageType;

    @IsNotEmpty()
    public listing: string;

    // todo: objects
    public objects?: any;

    constructor() {
        //
    }

}
