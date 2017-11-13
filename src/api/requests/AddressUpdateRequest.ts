import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class AddressUpdateRequest extends RequestBody {
    public title: string;

    @IsNotEmpty()
    public addressLine1: string;

    public addressLine2: string;

    @IsNotEmpty()
    public city: string;

    @IsNotEmpty()
    public country: string;

    @IsNotEmpty()
    public profileId: string;
}
