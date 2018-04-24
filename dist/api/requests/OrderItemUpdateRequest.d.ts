import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemObjectUpdateRequest } from './OrderItemObjectUpdateRequest';
import { OrderStatus } from '../enums/OrderStatus';
export declare class OrderItemUpdateRequest extends RequestBody {
    itemHash: string;
    status: OrderStatus;
    orderItemObjects: OrderItemObjectUpdateRequest[];
}
