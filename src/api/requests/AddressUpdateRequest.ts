import { IsNotEmpty, IsDefined, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class AddressUpdateRequest extends RequestBody {
    public title: string;

    @IsNotEmpty()
    public addressLine1: string;

    public addressLine2: string;

    @IsNotEmpty()
    public city: string;

    @IsDefined()
    public state: string;

    @IsNotEmpty()
    public country: string;

    @IsNotEmpty()
    public zipCode: string;

}
// tslint:enable:variable-name
