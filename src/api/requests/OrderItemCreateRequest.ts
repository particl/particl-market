import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemObjectCreateRequest } from './OrderItemObjectCreateRequest';
import { OrderStatus } from '../enums/OrderStatus';

// tslint:disable:variable-name
export class OrderItemCreateRequest extends RequestBody {

    @IsNotEmpty()
    public listing_item_id: number;

    @IsNotEmpty()
    public bid_id: number;

    @IsEnum(OrderStatus)
    @IsNotEmpty()
    public status: OrderStatus;

    public orderItemObjects: OrderItemObjectCreateRequest[];

    // @IsNotEmpty()
    public order_id: number;

}
// tslint:enable:variable-name
