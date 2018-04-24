import { RequestBody } from '../../core/api/RequestBody';
export declare class ShippingPriceUpdateRequest extends RequestBody {
    item_price_id: number;
    domestic: number;
    international: number;
}
