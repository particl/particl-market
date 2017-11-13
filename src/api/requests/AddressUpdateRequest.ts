import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class AddressUpdateRequest extends RequestBody {

    public title: string;

    @IsNotEmpty()
    public address_line1: string;

    public address_line2: string;

    @IsNotEmpty()
    public city: string;

    @IsNotEmpty()
    public country: string;

    @IsNotEmpty()
    public profile_id: string;

}
