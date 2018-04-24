import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemObjectCreateRequest } from './OrderItemObjectCreateRequest';
import { OrderStatus } from '../enums/OrderStatus';
export declare class OrderItemCreateRequest extends RequestBody {
    itemHash: string;
    bid_id: number;
    status: OrderStatus;
    orderItemObjects: OrderItemObjectCreateRequest[];
    order_id: number;
}
