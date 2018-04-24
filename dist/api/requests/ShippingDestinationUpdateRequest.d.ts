import { RequestBody } from '../../core/api/RequestBody';
import { ShippingAvailability } from '../../api/enums/ShippingAvailability';
export declare class ShippingDestinationUpdateRequest extends RequestBody {
    item_information_id: number;
    country: string;
    shippingAvailability: ShippingAvailability;
}
