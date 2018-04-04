import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import {OrderItemUpdateRequest} from './OrderItemUpdateRequest';

// tslint:disable:variable-name
export class OrderUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public address_id: number;

    @IsNotEmpty()
    public hash: string;

    public orderItems: OrderItemUpdateRequest[];

    @IsNotEmpty()
    public buyer: string;

    @IsNotEmpty()
    public seller: string;

}
// tslint:enable:variable-name
