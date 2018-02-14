import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

export class CurrencyPriceParams extends RequestBody {

    @IsNotEmpty()
    public from: string;

    @IsNotEmpty()
    public to: string;
}
