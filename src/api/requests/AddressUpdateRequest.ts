import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class AddressUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public profile_id: number;

    public title: string;

    @IsNotEmpty()
    public addressLine1: string;

    public addressLine2: string;

    @IsNotEmpty()
    public city: string;

    @IsNotEmpty()
    public country: string;

    @IsNotEmpty()
    public zipCode: string;

}
// tslint:enable:variable-name
