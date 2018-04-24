import { RequestBody } from '../../core/api/RequestBody';
export declare class CurrencyPriceUpdateRequest extends RequestBody {
    from: string;
    to: string;
    price: number;
}
