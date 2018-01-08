import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { Currency } from '../enums/Currency';

// tslint:disable:variable-name
export class ItemPriceCreateRequest extends RequestBody {

    @IsNotEmpty()
    public payment_information_id: number;

    @IsEnum(Currency)
    @IsNotEmpty()
    public currency: Currency;

    @IsNotEmpty()
    public basePrice: number;

    public shippingPrice;

    public cryptocurrencyAddress;
}
// tslint:enable:variable-name
