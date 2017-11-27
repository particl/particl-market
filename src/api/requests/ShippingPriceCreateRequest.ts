import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ShippingPriceCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_price_id: number;

    @IsNotEmpty()
    public domestic: number;

    @IsNotEmpty()
    public international: number;

}

