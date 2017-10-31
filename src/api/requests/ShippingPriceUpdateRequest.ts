import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ShippingPriceUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public domestic: number;

    @IsNotEmpty()
    public international: number;

}

