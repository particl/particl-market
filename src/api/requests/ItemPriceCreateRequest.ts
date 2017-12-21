import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ItemPriceCreateRequest extends RequestBody {

    @IsNotEmpty()
    public payment_information_id: number;

    @IsNotEmpty()
    public currency: string;

    @IsNotEmpty()
    public basePrice: number;

    public shippingPrice;

    public cryptocurrencyAddress;
}
// tslint:enable:variable-name
