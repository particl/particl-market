import { IsNotEmpty } from 'class-validator';

export class Bid {

    @IsNotEmpty()
    public version: string;

    @IsNotEmpty()
    public mpaction: any;

}
