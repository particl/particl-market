import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ShippingPriceUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public item_price_id: number;

    @IsNotEmpty()
    public domestic: number;

    @IsNotEmpty()
    public international: number;

}
// tslint:enable:variable-name
