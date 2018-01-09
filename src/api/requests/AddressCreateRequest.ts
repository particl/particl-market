import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { Country } from '../enums/Country';

// tslint:disable:variable-name
export class AddressCreateRequest extends RequestBody {

    @IsNotEmpty()
    public profile_id: number;

    public title: string;

    @IsNotEmpty()
    public addressLine1: string;

    public addressLine2: string;

    @IsNotEmpty()
    public city: string;

    @IsEnum(Country)
    @IsNotEmpty()
    public country: Country;

    @IsNotEmpty()
    public zipCode: string;

}
// tslint:enable:variable-name
