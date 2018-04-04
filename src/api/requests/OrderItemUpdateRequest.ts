import {IsEnum, IsNotEmpty} from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemObjectUpdateRequest } from './OrderItemObjectUpdateRequest';
import {OrderStatus} from '../enums/OrderStatus';

// tslint:disable:variable-name
export class OrderItemUpdateRequest extends RequestBody {

    @IsEnum(OrderStatus)
    @IsNotEmpty()
    public status: OrderStatus;

    public orderItemObjects: OrderItemObjectUpdateRequest[];

}
// tslint:enable:variable-name
