import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ShippingAvailability } from '../../api/enums/ShippingAvailability';
import { Country } from '../../api/enums/Country';

// tslint:disable:variable-name
export class ShippingDestinationUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public item_information_id: number;

    @IsEnum(Country)
    @IsNotEmpty()
    public country: Country;

    @IsEnum(ShippingAvailability)
    @IsNotEmpty()
    public shippingAvailability: ShippingAvailability;

}
// tslint:enable:variable-name
