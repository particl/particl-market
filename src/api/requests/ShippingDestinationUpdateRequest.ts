import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ShippingDestinationUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public country: string;

    @IsNotEmpty()
    public shippingAvailability: string;

}

