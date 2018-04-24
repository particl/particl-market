import { RequestBody } from '../../core/api/RequestBody';
export declare class ShippingPriceCreateRequest extends RequestBody {
    item_price_id: number;
    domestic: number;
    international: number;
}
