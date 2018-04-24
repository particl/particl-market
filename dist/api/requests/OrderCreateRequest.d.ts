import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemCreateRequest } from './OrderItemCreateRequest';
import { AddressCreateRequest } from './AddressCreateRequest';
export declare class OrderCreateRequest extends RequestBody {
    address: AddressCreateRequest;
    address_id: number;
    hash: string;
    orderItems: OrderItemCreateRequest[];
    buyer: string;
    seller: string;
}
