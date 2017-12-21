import { IsNotEmpty } from 'class-validator';
import { MarketplaceMessageInterface } from './MarketplaceMessageInterface';

export class EscrowMessageInterface implements MarketplaceMessageInterface {
    @IsNotEmpty()
    public version: string;

    @IsNotEmpty()
    public mpaction: any;
}
