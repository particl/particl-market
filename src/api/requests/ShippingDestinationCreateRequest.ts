import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ShippingDestinationCreateRequest extends RequestBody {

    @IsNotEmpty()
    public item_information_id: number;

    @IsNotEmpty()
    public country: string;

    @IsNotEmpty()
    public shippingAvailability: string;

}

