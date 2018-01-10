import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ShippingAvailability } from '../../api/enums/ShippingAvailability';

// tslint:disable:variable-name
export class ShippingDestinationSearchParams extends RequestBody {

    @IsNotEmpty()
    public item_information_id: number;

    @IsNotEmpty()
    public country: string;

    @IsEnum(ShippingAvailability)
    @IsNotEmpty()
    public shippingAvailability: ShippingAvailability;

}
// tslint:enable:variable-name
