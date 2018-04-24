import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemUpdateRequest } from './OrderItemUpdateRequest';
export declare class OrderUpdateRequest extends RequestBody {
    address_id: number;
    hash: string;
    orderItems: OrderItemUpdateRequest[];
    buyer: string;
    seller: string;
}
