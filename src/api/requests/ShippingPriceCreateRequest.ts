import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ShippingPriceCreateRequest extends RequestBody {

    @IsNotEmpty()
    public domestic: number;

    @IsNotEmpty()
    public international: number;

}

