import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class CryptocurrencyAddressCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_price_id: number;

    @IsNotEmpty()
    public type: string;

    @IsNotEmpty()
    public address: string;

}

