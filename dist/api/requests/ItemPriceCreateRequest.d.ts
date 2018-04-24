import { RequestBody } from '../../core/api/RequestBody';
import { Currency } from '../enums/Currency';
export declare class ItemPriceCreateRequest extends RequestBody {
    payment_information_id: number;
    currency: Currency;
    basePrice: number;
    shippingPrice: any;
    cryptocurrencyAddress: any;
}
