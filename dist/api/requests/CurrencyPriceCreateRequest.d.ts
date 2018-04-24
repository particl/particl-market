import { RequestBody } from '../../core/api/RequestBody';
export declare class CurrencyPriceCreateRequest extends RequestBody {
    from: string;
    to: string;
    price: number;
}
