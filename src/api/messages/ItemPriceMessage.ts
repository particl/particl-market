import { IsNotEmpty } from 'class-validator';

export class ItemPriceMessage {

    @IsNotEmpty()
    public currency: string;

    @IsNotEmpty()
    public basePrice: string;

    constructor() {
        //
    }
}
